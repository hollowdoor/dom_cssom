/*
git remote add origin https://github.com/hollowdoor/dom_cssom.git
git push -u origin master
*/
function domCSS(selector, attr){

    var doc = domCSS.document;

    if(typeof selector === 'string'){

        try{
            this.dom = doc.querySelector(selector);
        }catch(e){
            throw new TypeError(selector + ' is not a valid CSS selector.');
        }
        attr = attr || {};
    }else{
        this.dom = doc.createElement('style');
        doc.head.appendChild(this.dom);
        attr = selector || {};
    }

    this.sheet = this.dom.sheet;
    this.lastIndex = this.sheet.cssRules.length;

    this.classes = {};
    this.ids = {};
    this._mediaListeners = [];

    for(var n in attr){
        this.dom.setAttribute(n, attr[n]);
    }
}

domCSS.document = document || null;

domCSS.prototype = {
    constructor: domCSS,
    add: function(selector, attrs){

        var rules = '', selName, methodName;

        if(/^[.]/.test(selector)){
            selName = selector.replace(/^[.]/, '')
            this.classes[selName] = selName;
        }else if(/^[#]/.test(selector)){
            selName = selector.replace(/^[#]/, '')
            this.ids[selName] = selName;
        }

        for(var name in attrs){
            rules += name + ':' + attrs[name] + ';';
        }

        if("insertRule" in this.sheet) {
            this.sheet.insertRule(selector + "{" + rules + "}", this.sheet.cssRules.length);
        }else if("addRule" in sheet) {
		    this.sheet.addRule(selector, rules, this.sheet.cssRules.length);
	    }

        this.lastIndex = this.sheet.cssRules.length;

        return this;
    },
    remove: function(criteria){
        var rules = this.find(criteria, arguments[1]).reverse(), style;
        for(var i=0; i<rules.length; i++){
            rules.style = rules[i].style;
            this.sheet.deleteRule(rules[i].index);
        }
        this.lastIndex = this.sheet.cssRules.length;
        return rules;
    },
    find: function(criteria){

        if(!isNaN(criteria)){
            if(!isNaN(arguments[1])){
                criteria = [criteria, arguments[1]];
            }else{
                criteria = [criteria, this.sheet.cssRules.length];
            }
        }

        var indexes = getRuleIndexes(this.sheet, criteria), rule, rules = [];

        for(var i=0; i<indexes.length; i++){
            rule = {};
            rule.selector = this.sheet.cssRules[indexes[i]].selectorText;
            rule.index = indexes[i];
            rule.style = this.sheet.cssRules[indexes[i]].style;
            rules.push(rule);
        }

        return rules;
    },
    media: function(cond, cb){
        var mql = window.matchMedia(cond), css = this, count = null, first;
        queryListener(mql);

        if(!mql['addListener']) return this;

        mql.addListener(queryListener);

        function queryListener(mql){
            first = css.lastIndex - 1;

            if(mql.matches){
                cb(css);
                count = css.lastIndex > first + 1 ? css.lastIndex : null;
            }else if(count !== null){
                css.remove([first, count]);
                count = null;
            }
        }

        this._mediaListeners.push({
            mql: mql,
            listener: queryListener,
            actualListener: cb,
            cond: cond
        });

        return this;
    },
    mediaRemove: function(cond, listener){
        for(var i=0; i<this._mediaListeners; i++){
            if(this.mediaListeners[i].cond === cond && this._mediaListeners[i].actualListener === listener){
                this._mediaListeners[i].mql.removeListener(
                    this.mediaListener[i].listener
                );
                return this;
            }
        }
    },
    removeAll: function(){
        this.remove([0, this.sheet.cssRules.length]);
        return this;
    },
    destroy: function(){
        for(var i=0; i<this._mediaListeners.length; i++){
            this._mediaListeners[i].mql.removeListener(
                this._mediaListeners[i].listener
            );
        }

        document.head.removeChild(this.dom);
    }
};

module.exports = function domCSSFactory(css){
    return new domCSS();
};

function getRuleIndexes(sheet, criteria){

    var indexes = [], end;
    if(typeof criteria === 'string'){
        for(var i=0; i<sheet.cssRules.length; i++){
            if(sheet.cssRules[i].selectorText === criteria){
                indexes.unshift(i);
            }
        }

    }if(Object.prototype.toString.call(criteria) === '[object RegExp]'){
        for(var i=0; i<sheet.cssRules.length; i++){
            if(criteria.test(sheet.cssRules[i].selectorText)){
                indexes.unshift(i);
            }
        }
    }else if(Object.prototype.toString.call(criteria) === '[object Array]'){

        if(criteria.length === 1){
            end = sheet.cssRules.length;
        }else{
            end = criteria[1];
        }

        if(end > sheet.cssRules.length){
            end = sheet.cssRules.length;
        }

        for(var i=criteria[0]; i<end; i++){
            indexes.unshift(i);
        }
    }

    return indexes;
}
