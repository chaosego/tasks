class DateUtility {
    elapsedTime(date1: Date, date2: Date): number { // return diff in seconds
        if (date1 && date2){
            return Math.floor(Math.abs(date1.getTime() - date2.getTime()) / 1000);
        }
        return 0;
    }

    dateOnly(base?: Date): Date {
        if (base) {
            return new Date(base.getFullYear(),base.getMonth(),base.getDate(),0,0,0);
        }
        let newDate = new Date();
        return new Date(newDate.getFullYear(),newDate.getMonth(),newDate.getDate(),0,0,0);
    }

    addDays(base: Date, days: number): Date {
        return new Date(( base.getTime() + (days * 86400000) ));
    }

    newDateUpToSeconds(): Date {
        return new Date(Math.floor((new Date()).getTime() / 1000) * 1000);
    }

    /**
     * Fills string left or right to complete a given length with some char.
     * direction = 1 fills at right, direction = -1 fills at left
     */
    fillString(data: string | number, length: number, direction: number = 1, fillChar: string = ' '){
        let str = data + "";
        while (str.length < length){
            if (direction === 1){
                str += fillChar;
            } else {
                str = fillChar + str;
            }
        }
        return str;
    }

    /**
     * Returns formated date as specified in format or default if not provided.
     */
    formatDate(date: Date | string, format: string = 'yyyy-MM-dd') {
        if (date === null){
            return null;
        }
        if (!(date instanceof Date)){
            date = new Date(date);
        }
        const day: number = date.getDate();
        const month: number = date.getMonth();
        const year: number = date.getFullYear();
        const hour: number = date.getHours();
        const min: number = date.getMinutes();
        const sec: number = date.getSeconds();
        const zero: string = '0';

        const str: string = format.replace('yyyy', String(year))
            .replace('MM', this.fillString(month+1, 2, -1, zero))
            .replace('dd', this.fillString(day, 2, -1, zero))
            .replace('HH', this.fillString(hour, 2, -1, zero))
            .replace('mm', this.fillString(min, 2, -1, zero))
            .replace('ss', this.fillString(sec, 2, -1, zero))
            ;
        return str;
    }
}

export let DateUtils = new DateUtility();