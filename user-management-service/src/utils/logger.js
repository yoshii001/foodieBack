import pino from "pino";

const logger = pino({
    transport :{
        target: "pino-pretty",
        options:{
            colorize: true,
            translateTime: `SYS: yyyy-mm-dd HH:MM:ss`,
            ignore: "pid,hostname"
        }

    },
});

//This function modify the logger's color and the format to human readable

export default logger;