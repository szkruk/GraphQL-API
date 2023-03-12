import { BadRequestException } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { DatabaseException } from './Database.exception';
import { RequestLimitException } from './Request-Limit.exception';

export async function throwBadRequestOrDatabaseError(error: any) {
  if (error instanceof BadRequestException) {
    throw error;
  } else {
    throw new DatabaseException();
  }
}

export async function checkIfErrorOccurs(
  queryRunner: QueryRunner,
  error: any,
  attempt: number,
) {
  const maxAttempts = 5;

  if (error instanceof BadRequestException) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
    throw error;
  }

  if (error.code != '40001' && error.code != '23505') {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
    throw new DatabaseException();
  }

  if (attempt > maxAttempts) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
    throw new RequestLimitException();
  }
}
