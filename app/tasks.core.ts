// import { Injectable } from "@angular/core";

// @Injectable()
export class TasksCore {
    pendingRequests: Array<any> = [];
    data: any = {
        taskList: <any>[]
        , user: 'anon'
    };

    constructor() {
        let tasks = <any> this.tasksFromStorage();
        this.data.taskList = tasks;
    }

    mockData(){
        let T = this.data.taskList;
        let data = [{
            'tsk_date_add': new Date(2016,9,31,13,30,0)
            , 'tsk_name': '[Tasks] ActividadApp to Tasks - Start migration to Angular2!!'
            , 'tsk_ctg_status': 2
        },{
            'tsk_date_add': new Date(2016,10,1,22,36,12)
            , 'tsk_name': '[Tasks] ActividadApp to Tasks - Service configuration test'
            , 'tsk_ctg_status': 2
        },{
            'tsk_date_add': new Date(2016,10,4,16,32,27)
            , 'tsk_name': '[Tasks] ActividadApp to Tasks - Id generation for task'
            , 'tsk_ctg_status': 2
            , 'tsk_time_history': [
                {
                    'tsh_id': ''
                    , 'tsh_num_secuential': 1
                    , 'tsh_date_start': new Date(2016,10,4,20,0,2)
                    , 'tsh_date_end': new Date(2016,10,4,21,20,0)
                    , 'tsh_time_spent': 0
                    , 'tsh_id_user': 2
                    , 'tsh_date_add': new Date(2016,10,4,19,25,0)
                    , 'tsh_date_mod': new Date(2016,10,4,19,25,0)
                }
            ]
        }];
        
        data.forEach((t) => {
            // T.push(this.newTaskTemplate(t));
            this.addTask(t);
            // console.log(T[T.length-1]);
        });
    }

    /** BEGIN API methods */
    /**
     * Creation and addition of a new task to the collection.
     * @param {object} task A basic task model, for simplicity to be extended and added to the task collection.
     * @return {object} The task added to the collection (as a complete task model).
     */
    addTask(task: any){
        let T = this.data.taskList;

        // detect group list for the task (at start of text)
        if (task.tsk_name.startsWith('[')){
            task.tsk_id_record = task.tsk_name.substr(task.tsk_name.indexOf('[')+1,task.tsk_name.indexOf(']')-1);
            task.tsk_name = task.tsk_name.replace(`[${task.tsk_id_record}] `,'');
        }

        // Parse special tokens
        // [DATE]
        let tokens = [{
            'tokenStr': '[DATE]',
            'replaceMethod': () => this.dateWithFormat(this.dateOnly(new Date())).substring(0,10)
        },{
            'tokenStr': '[DATETIME]',
            'replaceMethod': () => this.dateWithFormat(this.dateOnly(new Date()))
        }];
        tokens.forEach((token) => {
            task.tsk_name = this.replaceAll(task.tsk_name,token.tokenStr,token.replaceMethod())
        });

        // detect Start Date and End Date
        if (task.tsk_name.indexOf('%[')){
            let endPosition = task.tsk_name.indexOf(']',task.tsk_name.indexOf('&[')) === -1 ? task.tsk_name.length : task.tsk_name.indexOf(']',task.tsk_name.indexOf('%['));
            let expression = task.tsk_name.substring(task.tsk_name.indexOf('%[') + 2,endPosition);
            let parts = '';
            let parsed = false;
            task.tsk_name = task.tsk_name.replace('%[' + expression + '] ','');
            task.tsk_name = task.tsk_name.replace(' %[' + expression + ']','');
            task.tsk_name = task.tsk_name.replace('%[' + expression + ']','');

            let patternTime = /\d{2}/i;
            let patternDateTime = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/i;
            let patternDateTimeEnd = /\d{4}-\d{2}-\d{2} \d{2}:\d{2} - \d{2}:\d{2}/i;
            let patternDateTimeDuration = /\d{4}-\d{2}-\d{2} \d{2}:\d{2} \+ /i;
            let patternTimeEnd = /\d{2}:\d{2} - \d{2}:\d{2}/i;
            let patternTimeDuration = /\d{2}:\d{2} \+ /i;

            // start date and time and duration -> yyyy-MM-dd HH:mm + ##h##m
            if (patternDateTimeDuration.test(expression)){
                parts = expression.split(' + ');
                task.tsk_schedule_date_start = new Date(parts[0]);
                task.tsk_estimated_duration = this.parseTime(parts[1]);
                task.tsk_schedule_date_end = new Date(task.tsk_schedule_date_start.getTime() + task.tsk_estimated_duration * 60 * 1000);
                parsed = true;
            }

            // start time and duration -> HH:mm + ##h##m
            if (patternTimeDuration.test(expression) && !parsed){
                parts = expression.split(' + ');
                let min = parseInt(parts[0].split(':')[0]) * 60 + parseInt(parts[0].split(':')[1]);
                task.tsk_schedule_date_start = new Date(this.dateOnly(new Date()).getTime() + (min * 60 * 1000));
                task.tsk_estimated_duration = this.parseTime(parts[1]);
                task.tsk_schedule_date_end = new Date(task.tsk_schedule_date_start.getTime() + task.tsk_estimated_duration * 60 * 1000);
                parsed = true;
            }

            // start date and time and end time -> yyyy-MM-dd HH:mm - HH:mm
            if (patternDateTimeEnd.test(expression) && !parsed){
                parts = expression.split(' - ');
                let dateOnly = parts[0].split(' ')[0];
                task.tsk_schedule_date_start = new Date(parts[0]);
                task.tsk_schedule_date_end = new Date(dateOnly + ' ' + parts[1]);
                task.tsk_estimated_duration = this.elapsedTime(task.tsk_schedule_date_start,task.tsk_schedule_date_end) / 60;
                parsed = true;
            }

            // start time and end time -> HH:mm - HH:mm
            if (patternTimeEnd.test(expression) && !parsed){
                parts = expression.split(' - ');
                let min1 = parseInt(parts[0].split(':')[0]) * 60 + parseInt(parts[0].split(':')[1]);
                let min2 = parseInt(parts[1].split(':')[0]) * 60 + parseInt(parts[1].split(':')[1]);
                task.tsk_schedule_date_start = new Date(this.dateOnly(new Date()).getTime() + (min1 * 60 * 1000));
                task.tsk_schedule_date_end = new Date(this.dateOnly(new Date()).getTime() + (min2 * 60 * 1000));
                task.tsk_estimated_duration = this.elapsedTime(task.tsk_schedule_date_start,task.tsk_schedule_date_end) / 60;
                parsed = true;
            }

            // start date and time -> yyyy-MM-dd HH:mm
            if (patternDateTime.test(expression) && !parsed){
                let dateParts = expression.substring(0,10).split('-');
                task.tsk_schedule_date_start = new Date(expression);
                parsed = true;
            }

            // time only -> HH:mm
            if (patternTime.test(expression) && !parsed){
                let min = parseInt(expression.split(':')[0]) * 60 + parseInt(expression.split(':')[1]);
                task.tsk_schedule_date_start = new Date(this.dateOnly(new Date()).getTime() + (min * 60 * 1000));
                parsed = true;
            }

        }

        // detect estimated duration
        if (task.tsk_name.indexOf('%') !== -1 && task.tsk_name.indexOf('%%') === -1){
            let endPosition = task.tsk_name.indexOf(' ',task.tsk_name.indexOf('%')) === -1 ? task.tsk_name.length : task.tsk_name.indexOf(' ',task.tsk_name.indexOf('%'));
            let duration = task.tsk_name.substring(task.tsk_name.indexOf('%') + 1,endPosition);
            
            task.tsk_name = task.tsk_name.replace('%' + duration + ' ','');
            task.tsk_name = task.tsk_name.replace(' %' + duration,'');
            task.tsk_name = task.tsk_name.replace('%' + duration,'');

            duration = this.parseTime(duration);

            task.tsk_estimated_duration = parseInt(duration);
        }

        // detect [OPEN] token, creates task as an OPEN task
        if (task.tsk_name.indexOf('[OPEN]') !== -1){
            task.tsk_name = task.tsk_name.replace('[OPEN] ','');
            task.tsk_name = task.tsk_name.replace(' [OPEN]','');
            task.tsk_name = task.tsk_name.replace('[OPEN]','');

            task.tsk_ctg_status = 2 // OPEN
        }

        // detects $[] qualifiers
        if (task.tsk_name.indexOf('$[') !== -1){
            let endPosition = task.tsk_name.indexOf(']',task.tsk_name.indexOf('$[')) === -1 ? task.tsk_name.length : task.tsk_name.indexOf(']',task.tsk_name.indexOf('$['));
            let expression = task.tsk_name.substring(task.tsk_name.indexOf('$[') + 2,endPosition);

            task.tsk_name = task.tsk_name.replace('$[' + expression + '] ','');
            task.tsk_name = task.tsk_name.replace(' $[' + expression + ']','');
            task.tsk_name = task.tsk_name.replace('$[' + expression + ']','');

            task.tsk_qualifiers = expression;
        }

        T.push(this.newTaskTemplate(task));
        // console.log(T[T.length-1]);
        this.tasksToStorage();
        return T[T.length-1];
    }

    /**
     * Extends a basic task model so it has all of the properties of a complete task model.
     * @param {object} a Basic task model to be extended, it has some properties used in the complete task model.
     * @return {object} A complete task model extended with the data of the basic task model.
     */
    newTaskTemplate(task: any){
        return {
            'tsk_id': this.generateId()
            , 'tsk_id_container': 'tasks'
            , 'tsk_id_record': task.tsk_id_record || 'general'
            , 'tsk_name': task.tsk_name
            , 'tsk_notes': task.tsk_notes || ''
            , 'tsk_parent': task.tsk_parent || 0
            , 'tsk_order': this.data.taskList.length + 1
            , 'tsk_date_done': <Date>undefined
            , 'tsk_total_time_spent': 0
            , 'tsk_time_history': task.tsk_time_history || <any>[]
            , 'tsk_ctg_in_process': task.tsk_ctg_in_process || 1
            , 'tsk_qualifiers': task.tsk_qualifiers || ''
            , 'tsk_tags': task.tsk_tags || ''
            , 'tsk_estimated_duration': task.tsk_estimated_duration || 0
            , 'tsk_schedule_date_start': task.tsk_schedule_date_start || undefined
            , 'tsk_schedule_date_end': task.tsk_schedule_date_end || undefined
            , 'tsk_schedule_history': <any>[]
            , 'tsk_date_view_until': task.tsk_date_view_until || <Date>undefined
            , 'tsk_notifications': <any>[]
            , 'tsk_id_user_added': task.tsk_id_user_added || this.data.user
            , 'tsk_id_user_asigned': task.tsk_id_user_asigned || this.data.user
            , 'tsk_date_add': task.tsk_date_add || new Date()
            , 'tsk_date_mod': new Date()
            , 'tsk_ctg_status': task.tsk_ctg_status || 1
        }
    }

    tasks(){
        return this.data.taskList;
    }

    tasksGroups(){

    }

    pad(value: string | number, fillChar: string, length: number, dir: number = -1){
        let result: string = value + '';
        while(result.length < length){
            if (dir === -1){
                result = fillChar + result;
            } else {
                result = result + fillChar;
            }
        }
        return result;
    }

    generateId(){
        // take date + time + random 10 digits
        // total digits 10 + 6 + 10 = 26
        let date = new Date();
        let random = Math.floor(Math.random() * 1e14);
        let datetimeString = `${date.getFullYear()}${this.pad(date.getMonth()+1,'0',2)}${this.pad(date.getDate(),'0',2)}`;
        datetimeString += `${this.pad(date.getHours(),'0',2)}${this.pad(date.getMinutes(),'0',2)}${this.pad(date.getSeconds(),'0',2)}`;
        let id = `T${datetimeString}-${random}`;
        return id;
    }

    /** BEGIN Storage */
    tasksFromStorage(){
        if(typeof(window.localStorage) !== "undefined") {
            let tasks = JSON.parse(localStorage.getItem("Tasks"));
            if (tasks){
                // parse dates
                tasks.forEach((t: any) => {
                    t.tsk_date_done = this.stringDateToDate(t.tsk_date_done);
                    t.tsk_schedule_date_start = this.stringDateToDate(t.tsk_schedule_date_start);
                    t.tsk_schedule_date_end = this.stringDateToDate(t.tsk_schedule_date_end);
                    t.tsk_date_view_until = this.stringDateToDate(t.tsk_date_view_until);
                    t.tsk_date_add = this.stringDateToDate(t.tsk_date_add);
                    t.tsk_date_mod = this.stringDateToDate(t.tsk_date_mod);
                    
                    t.tsk_time_history.forEach((h: any) => {
                        h.tsh_date_start = this.stringDateToDate(h.tsh_date_start);
                        h.tsh_date_end = this.stringDateToDate(h.tsh_date_end);
                        h.tsh_date_add = this.stringDateToDate(h.tsh_date_add);
                        h.tsh_date_mod = this.stringDateToDate(h.tsh_date_mod);
                    });
                });
                return tasks;
            }
        }
        return [];
    }

    tasksToStorage(){
        if(typeof(window.localStorage) !== "undefined") {
            localStorage.setItem("Tasks", JSON.stringify(this.data.taskList));
        }
    }
    /** END Storage */

    stringDateToDate(date: string){
        if(/\d{4}-\d{2}-\d{2}/.test(date)){ // looks like a date
            return new Date(date);
        }
        return undefined;
    }


    updateTask(task: any, newData: any){
        Object.keys(newData).forEach(k => {
            task[k] = newData[k];
        });
        task.tsk_date_mod = new Date(); 
        this.tasksToStorage();
    }

    addTimeTracking(task: any){
        task.tsk_time_history.push({
            'tsh_id': task.tsk_id
            , 'tsh_num_secuential': (task.tsk_time_history.length + 1)
            , 'tsh_name': task.tsk_name
            , 'tsh_date_start': new Date()
            , 'tsh_date_end': null
            , 'tsh_time_spent': 0
            , 'tsh_id_user': 'anon'
            , 'tsh_date_add': new Date()
            , 'tsh_date_mod': new Date()
        });
        this.tasksToStorage();
    }

    stopTimeTracking(task: any){
        let h = task.tsk_time_history[task.tsk_time_history.length - 1];
        h.tsh_name = task.tsk_name;
        h.tsh_date_end = new Date();
        h.tsh_time_spent = this.elapsedTime(h.tsh_date_start,h.tsh_date_end);
        h.tsh_date_mod = new Date();

        this.recalculateTotalTimeSpent(task);
        this.tasksToStorage();
    }

    recalculateTotalTimeSpent(task: any){
        // sum in task
        let sum: number = 0;
        task.tsk_time_history.forEach((t: any) => {
            sum += t.tsh_time_spent;
        });
        task.tsk_total_time_spent = sum;
    }

    elapsedTime(date1: Date, date2: Date) :number{ // return diff in seconds
        return Math.abs(date1.getTime() - date2.getTime()) / 1000;
    }

    elapsedDays(date1: Date, date2: Date) :number{
        return Math.floor(this.elapsedTime(this.dateOnly(date1),this.dateOnly(date2)) / (60 * 60 * 24));
    }

    updateTaskTimeTracking(taskTimeTracking: any, newData: any){
        Object.keys(newData).forEach(k => {
            taskTimeTracking[k] = newData[k];
        });
        if (taskTimeTracking.tsh_date_end !== null){
            taskTimeTracking.tsh_time_spent = this.elapsedTime(new Date(taskTimeTracking.tsh_date_start),new Date(taskTimeTracking.tsh_date_end));
        } else {
            taskTimeTracking.tsh_time_spent = 0;
        }
        taskTimeTracking.tsh_date_mod = new Date();
        this.recalculateTotalTimeSpent(this.data.taskList.find((t: any) => t.tsk_id === taskTimeTracking.tsh_id));
        this.tasksToStorage();
    }

    deleteTasks(){
        this.data.taskList = [];
        this.tasksToStorage();
    }

    dateOnly(base: Date){
        return new Date(base.getFullYear(),base.getMonth(),base.getDate(),0,0,0);
    }

    dateWithFormat(date: Date){
        var str = date.getFullYear() + "-" + (date.getMonth()+1>9?date.getMonth()+1:"0"+(date.getMonth()+1)) + "-" + (date.getDate()>9?date.getDate():"0"+date.getDate());
        str += " " + (date.getHours()>9?date.getHours():"0"+date.getHours()) + ":" + (date.getMinutes()>9?date.getMinutes():"0"+date.getMinutes()) + ":" + (date.getSeconds()>9?date.getSeconds():"0"+date.getSeconds());
        return str;
    }

    replaceAll(str: string, find: string, replace: string){
        return str.replace(new RegExp(this.escapeRegExp(find), "g"), replace);
    }

    escapeRegExp(str: string){
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    parseTime(duration: string){
        let hours = 0, min = 0;
        if (duration.indexOf('h') !== -1){
            hours = parseInt(duration.substring(0,duration.indexOf('h')));
            duration = duration.replace(hours + 'h','');
        }
        if (duration.indexOf(':') !== -1){
            hours = parseInt(duration.substring(0,duration.indexOf(':')));
            duration = duration.replace(hours + ':','');
        }
        if (duration.indexOf('m') !== -1){
            min = parseInt(duration.substring(0,duration.indexOf('m')));
            duration = duration.replace(min + 'm','');
        } else {
            if (duration !== ''){
                min = parseInt(duration);
                duration = duration.replace(min + '','');
            }
        }
        if (duration === ''){
            return hours * 60 + min;
        }
        return parseInt(duration);
    }

    parseDatetime(expression: string){
        let parts = <any>[];
        let parsed: boolean = false;
        let s = {
            date_start: <Date>null
            , date_end: <Date>null
            , duration: 0
            , pattern: ''
        };

        let patternTime = /\d{2}/i;
        let patternDateTime = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/i;
        let patternDateTimeEnd = /\d{4}-\d{2}-\d{2} \d{2}:\d{2} - \d{2}:\d{2}/i;
        let patternDateTimeDuration = /\d{4}-\d{2}-\d{2} \d{2}:\d{2} \+ /i;
        let patternTimeEnd = /\d{2}:\d{2} - \d{2}:\d{2}/i;
        let patternTimeDuration = /\d{2}:\d{2} \+ /i;

        // start date and time and duration -> yyyy-MM-dd HH:mm + ##h##m
        if (patternDateTimeDuration.test(expression)){
            parts = expression.split(' + ');
            s.date_start = new Date(parts[0]);
            s.duration = this.parseTime(parts[1]);
            s.date_end = new Date(s.date_start.getTime() + s.duration * 60 * 1000);
            parsed = true;
            s.pattern = 'yyyy-MM-dd HH:mm + ##h##m';
        }

        // start time and duration -> HH:mm + ##h##m
        if (patternTimeDuration.test(expression) && !parsed){
            parts = expression.split(' + ');
            let min = parseInt(parts[0].split(':')[0]) * 60 + parseInt(parts[0].split(':')[1]);
            s.date_start = new Date(this.dateOnly(new Date()).getTime() + (min * 60 * 1000));
            s.duration = this.parseTime(parts[1]);
            s.date_end = new Date(s.date_start.getTime() + s.duration * 60 * 1000);
            parsed = true;
            s.pattern = 'HH:mm + ##h##m';
        }

        // start date and time and end time -> yyyy-MM-dd HH:mm - HH:mm
        if (patternDateTimeEnd.test(expression) && !parsed){
            parts = expression.split(' - ');
            let dateOnly = parts[0].split(' ')[0];
            s.date_start = new Date(parts[0]);
            s.date_end = new Date(dateOnly + ' ' + parts[1]);
            s.duration = this.elapsedTime(s.date_start,s.date_end) / 60;
            parsed = true;
            s.pattern = 'yyyy-MM-dd HH:mm - HH:mm';
        }

        // start time and end time -> HH:mm - HH:mm
        if (patternTimeEnd.test(expression) && !parsed){
            parts = expression.split(' - ');
            let min1 = parseInt(parts[0].split(':')[0]) * 60 + parseInt(parts[0].split(':')[1]);
            let min2 = parseInt(parts[1].split(':')[0]) * 60 + parseInt(parts[1].split(':')[1]);
            s.date_start = new Date(this.dateOnly(new Date()).getTime() + (min1 * 60 * 1000));
            s.date_end = new Date(this.dateOnly(new Date()).getTime() + (min2 * 60 * 1000));
            s.duration = this.elapsedTime(s.date_start,s.date_end) / 60;
            parsed = true;
            s.pattern = 'HH:mm - HH:mm';
        }

        // start date and time -> yyyy-MM-dd HH:mm
        if (patternDateTime.test(expression) && !parsed){
            let dateParts = expression.substring(0,10).split('-');
            s.date_start = new Date(expression);
            parsed = true;
            s.pattern = 'yyyy-MM-dd HH:mm';
        }

        // time only -> HH:mm
        if (patternTime.test(expression) && !parsed){
            let min = parseInt(expression.split(':')[0]) * 60 + parseInt(expression.split(':')[1]);
            s.date_start = new Date(this.dateOnly(new Date()).getTime() + (min * 60 * 1000));
            parsed = true;
            s.pattern = 'HH:mm';
        }

        return s;
    }

}