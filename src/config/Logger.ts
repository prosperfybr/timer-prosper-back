// src/shared/utils/logger.ts

enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG',
}

/**
 * Retorna o prefixo do log formatado (Timestamp e Nível).
 * @param level O nível de severidade do log.
 */
const getLogPrefix = (level: LogLevel): string => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ::`;
};

// Funções de logging customizadas
export const log = {
    info: (...args: any[]) => {
        console.info(getLogPrefix(LogLevel.INFO), ...args);
    },
    warn: (...args: any[]) => {
        console.warn(getLogPrefix(LogLevel.WARN), ...args);
    },
    error: (...args: any[]) => {
        // Para erros, mostramos a pilha de erros (stack trace) se for um objeto Error
        const prefix = getLogPrefix(LogLevel.ERROR);
        const error = args.find(arg => arg instanceof Error);
        
        if (error) {
            console.error(prefix, ...args);
            console.error(error.stack);
        } else {
            console.error(prefix, ...args);
        }
    },
    debug: (...args: any[]) => {
        // Opcional: só logar se estiver em ambiente de desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.log(getLogPrefix(LogLevel.DEBUG), ...args);
        }
    },
};