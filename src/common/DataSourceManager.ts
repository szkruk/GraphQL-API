import { BadRequestException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { DatabaseException } from './Database.exception';
import { RequestLimitException } from './Request-Limit.exception';

export class DataSourceManager {
  private queryRunner: QueryRunner;
  constructor(private dataSource: DataSource) {}

  private readonly maxAttempts = 5;
  private readonly delayMs = 1000;

  async startConnection(): Promise<void> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
  }

  async releaseConnection() {
    await this.queryRunner.release();
  }

  async startTransaction() {
    await this.queryRunner.startTransaction('SERIALIZABLE');
  }

  async commitTransaction() {
    await this.queryRunner.commitTransaction();
    await this.queryRunner.release();
  }

  async rollbackAndReleaseTransaction() {
    await this.queryRunner.rollbackTransaction();
    await this.queryRunner.release();
  }

  async throwDatabaseorBadRequestException(error: Error) {
    await this.queryRunner.release();
    if (error instanceof BadRequestException) {
      throw error;
    } else {
      throw new DatabaseException();
    }
  }

  async checkForThrowingError(error: any, attempt) {
    if (error instanceof BadRequestException) {
      await this.rollbackAndReleaseTransaction();
      throw error;
    }

    if (error.code != '40001' && error.code != '23505') {
      await this.rollbackAndReleaseTransaction();
      throw new DatabaseException();
    }

    if (attempt > this.maxAttempts) {
      await this.rollbackAndReleaseTransaction();
      throw new RequestLimitException();
    }
  }

  async rollbackAndWait(attempt) {
    await this.queryRunner.rollbackTransaction();
    attempt += 1;

    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }

  getManager() {
    return this.queryRunner.manager;
  }
}
