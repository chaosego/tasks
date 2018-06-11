import { Promise } from 'es6-promise';

interface iConnection {
    close: () => void
    , runSql: (sql: string) => Promise<any>
    , runSqlArray: (sqlArray: Array<string>) => Array<Promise<any>>
}
export default iConnection;