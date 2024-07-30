export class Engine {
    constructor(context, task, objectTask){
        this.context = context;
        this.task = task;
        this.objectTask = objectTask;
    }
    process(value, type, result){
        const stack = {};
        this.processVariable(value, type, stack, result);
        return result;
    }
    processVariable(value, type, stack, result){
        const definition = this.context[type];
        if (stack[type])
            throw new Error('Infinite loop');
        stack[type] = definition;
        const taskResult = this.task(value, type, definition, result);
        if (!definition.native && definition.type)
            this.processVariable(value, definition.type, stack, result);
        else if (type === "Object" && value && value.items)
            this.processObject(value, stack, result, taskResult);
        else if (type === "Array" && value && value.items)
            this.processArray(value, stack, result, taskResult);
    }
    processObject(value, stack, result, taskResult){
        for (let type in stack){
            let definition = stack[type];
            if (definition.items)
                for (let property in definition.items){
                    let nestedDefinition = definition.items[property];
                    let nestedValue;
                    if (value.items)
                        nestedValue = value.items[property];
                    let nestedResult = [];
                    this.processVariable(nestedValue, nestedDefinition.type, {}, nestedResult);
                    this.objectTask(property, nestedValue, nestedDefinition.type, nestedDefinition, result, nestedResult, taskResult);
                }
        }
    }
    processArray(value, stack, result, taskResult){
        for (let type in stack){
            let nestedDefinition = stack[type].items;
            if (nestedDefinition)
                for (let index = 0; index<value.items.length; ++index){
                    let nestedValue = value.items[index];
                    let nestedResult = [];
                    this.processVariable(nestedValue, nestedDefinition.type, {}, nestedResult);
                    this.objectTask(index, nestedValue, nestedDefinition.type, nestedDefinition, result, nestedResult, taskResult);
                }
        }
    }
}