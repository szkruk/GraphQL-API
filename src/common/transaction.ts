import { DataSource, QueryRunner } from 'typeorm';

export class DataSourceManager {
  private queryRunner: QueryRunner;
  constructor(private dataSource: DataSource) {}

  async startConnection(): Promise<void> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
  }

  async releaseConnection() {
    await this.queryRunner.release();
  }

  async startTransaction() {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction('SERIALIZABLE');
  }

  async commitTransaction() {
    await this.queryRunner.commitTransaction();
    await this.queryRunner.release();
  }

  async rollbackTransaction() {
    await this.queryRunner.rollbackTransaction();
    await this.queryRunner.release();
  }

  getManager() {
    return this.queryRunner.manager;
  }
}
