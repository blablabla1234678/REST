export default class DocumentationParser {
    context(context){
        this.ctx = context;
    }
    process(partialOrType){
        let partial;
        if (typeof(partialOrType) === "string")
            partial = {type:partialOrType};
        else
            partial = partialOrType;
        return this.processVerticalTypeChain(partial, {});
    }
    processVerticalTypeChain(partial, stack){
        let mosaic = {};
        let type;
        while(partial){
            type = partial.type;
            if (stack[type] && this.ctx[type])
                throw new Error(`Infinite loop caused by ${type}.`);
            stack[type] = true;
            for (let option in partial){
                if (option === "type" || option === "items" || option === "request" || option === "response"){
                    if (!mosaic[option])
                        mosaic[option] = [];
                    mosaic[option].push(partial[option]);
                }
                else if (!mosaic.hasOwnProperty(option))
                    mosaic[option] = partial[option];
            }
            partial = this.ctx[type];
        }
        if ((type === "Object" || type === "FlatObject") && mosaic.items)
            this.processObject(mosaic, stack);
        else if ((type === "Array" || type === "FlatArray") && mosaic.items)
            this.processArray(mosaic, stack);
        else if (type === "Hyperlink" && (mosaic.request || mosaic.response))
            this.processHyperlink(mosaic, stack);
        return mosaic;
    }

    processObject(mosaic, stack){
        let partials = {};
        for (let itemsPartial of mosaic.items)
            for (let property in itemsPartial){
                if (!partials[property])
                    partials[property] = [];
                partials[property].push(itemsPartial[property]);
            }
        mosaic.items = {};
        for (let property in partials)
            mosaic.items[property] = this.processHorizontalTypeChain(partials[property], stack);
    }

    processArray(mosaic, stack){
        if (mosaic.items)
            mosaic.items = this.processHorizontalTypeChain(mosaic.items, stack);
    }

    processHyperlink(mosaic, stack){
        let properties = {request: mosaic.request, response: mosaic.response};
        for (let property in properties)
            if (properties[property])
                mosaic[property] = this.processHorizontalTypeChain(properties[property], Object.create(stack));
    }

    processHorizontalTypeChain(partials, stack){
        let mosaic = {};
        for (let partial of partials)
            for (let option in partial)
                if (!mosaic.hasOwnProperty(option))
                    mosaic[option] = partial[option];
        return this.processVerticalTypeChain(mosaic, Object.create(stack));
    }
}
