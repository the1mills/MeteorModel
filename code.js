var objectAssign = require('object-assign');


/*
debugging hints:

subo stands for 'subobject'
.expand is the object inheritance analog of .extend (for class inheritance)

prop and attr are interchangeable, standing for property and attribute respectively

*/

/*MongoDB supports many datatypes whose list is given below:

    String : This is most commonly used datatype to store the data. String in mongodb must be UTF-8 valid.
    Integer : This type is used to store a numerical value. Integer can be 32 bit or 64 bit depending upon your server.
    Boolean : This type is used to store a boolean (true/ false) value.
    Double : This type is used to store floating point values.
    Min/ Max keys : This type is used to compare a value against the lowest and highest BSON elements.
    Arrays : This type is used to store arrays or list or multiple values into one key.
    Timestamp : ctimestamp. This can be handy for recording when a document has been modified or added.
    Object : This datatype is used for embedded documents.
    Null : This type is used to store a Null value.
    Symbol : This datatype is used identically to a string however, it's generally reserved for languages that use a specific symbol type.
    Date : This datatype is used to store the current date or time in UNIX time format. You can specify your own date time by creating object of Date and passing day, month, year into it.
    Object ID : This datatype is used to store the document’s ID.
    Binary data : This datatype is used to store binay data.
    Code : This datatype is used to store javascript code into document.
    Regular expression : This datatype is used to store regular expression

    */


var errors = {

    missingMandatoryField: function(prop){
        return 'MeteorModel tried to find the schema-defined field >>\'' + prop + ':\'<< but the data that the user/programmer passed to the create method doesnt contain this required field.' +
            '\nTo remedy this problem, either change the isMandatoryUponCreate field to false, or pass the required datum to the create method. ' +
            '\nFor example, you may have passed this empty data: {}, when' +
            '\nin fact this was required by your MeteorModel schema: {' + prop + ':someValueWithTheCorrectTypeDefinedByYourSchema}';
    },
    cantOverrideSuperObjectMethod: function(attr){
        return 'Can\'t override ' + attr + ' method of MeteorModel, sorry, see docs at https://github.com/the1mills/MeteorModel';
    },
    invalidSchemaType: function(schemaType){
        return 'The following is not a valid schema type:' + schemaType + ','+
            '\nvalid schema types in MeteorModel correspond to the types that MongoDB will accept and include the literals' +
            '\n(without quotes) String, Number, Integer, Boolean, Null, Code, ObjectID, Symbol, Timestamp, Date, Object, Arrays';
    },
    wrongDataType: function(expectedType, actualType){
        return 'Wrong type. It\'s a data and schema mismatch. MeteorModel expected the following type:>>' + expectedType + '<<but the type that we got was>>' + actualType +'<<.' +
            '\nFix either your schema or your data.';
    },
    mustExpandMeteorModel: function(){
        return 'The create function happens to exist for the MeteorModelPrototype object, but'+
        '\nyou must call MeteorModelPrototype.expand({your code here}) in order to call \'create\' on the resulting subobject (expansion) -' +
                '\nso instead of calling MeteorModelPrototype.create({}) you must call MeteorModelPrototype.expand({}).create()'+
            '\nsee docs at https://github.com/the1mills/MeteorModel';
    },
    extraneousFieldInData: function(prop){

      return 'tried to validate field >>' + prop + '<< but your schema doesnt contain this field, and because this.schemaAllowExtraneousFields is set to false,' +
          '\nyou cannot pass fields that aren\'t represented in the schema you defined.';

    },
    beforeSavingModelYouMustDefineACollectionToSaveTo: function(){
        return 'Before Saving a MeteorModel Expansion You Must Define A Collection To Save To - to fix this error your options are:'+
                '\n(1) quit programming and try another life calling'+
                '\n(2) define a collectionInfo object like so: MeteorModelPrototype.expand({collectionInfo:{}})'+
                '\n(3) pass a Meteor collectionInfo object into the save function like so '
    }
};


MeteorModelPrototype = {

    isMeteorModel: true,

    expandOld: function(subo){
        subo.superclass = this;
        return subo;
    },
    expandOldish: function(subo){
        var old = subo;
        subo.prototype = Object.create(this,{
            xxx: {},
            xxf: function(){
            }
        });
        subo.prototype.constructor = old;
        return subo;
    },
    expandLesOld: function(subo){
        // var x = Object.create(this,subo.prototype);
        //console.log('subo prototype', subo.prototype);
        //var x = Object.create(Object.getPrototypeOf(this),Object.getPrototypeOf(subo));
        //var x = Object.create(this.__proto__,subo.__proto__);
        //var x = Object.create(MeteorModelSuper);

        //subo.prototype = Object.create(this);

        for(var attr in this){
            if(subo[attr] != null){
                console.log('subo[attr]:',subo[attr]);
                return null;
            }
            subo[attr] = this[attr];
        }
        return subo;
    },
    expand: function(subo){
        //if user wants to call super, calls super methods by using this.superObj

        /*if(this.expandedOnceAlready == null){
         this.expandedOnceAlready = true;
         }
         else{
         throw 'can only expand MeteorModelPrototype to a subobject once';
         return null;
         }*/

        subo.prototype = this; // just to be damn sure

        for(var attr in subo){
            if(attr == 'expand' || attr == 'create' || attr == 'createAndSave'){
                throw errors.cantOverrideSuperObjectMethod(attr);
                return null;
            }
        }

        for(var attr in this){
            if(attr == 'isMeteorModel'){
                continue;
            }
            subo[attr] = this[attr];
        }
        return subo;
    },
    expandAssign: function(subo){
        //if user wants to call super, calls super methods by using this.superclass
        // -or- we can say if user redefines a method name, we could create a hash between superclass method names
        // and subolass method names which incidentally override them, and then rename the subolass names
        subo.superObject = this;

        return objectAssign(subo,this);
    },
    expandWOOverride: function(subo){
        subo.superObject = this;
        for(var attr in this){
            if(subo[attr] != null){
                var name_ = attr +'_' + subo;
                subo[name_] = subo[attr];
            }
            subo[attr] = this[attr];
        }
        return subo;
    },

    createWeird: function(o){
        function F(){

        }
        F.prototype = o;
        return new F;
    },
    create: function(data, collectionInfo){

        if(this.isMeteorModel){
            throw errors.mustExpandMeteorModel();
            return null;
        }

        if(collectionInfo != 'null'){
            this.collectonInfo = collectionInfo;
        }

        if(this.schema !== 'null' && this.schemaAllowExtraneousFields == false){
            for(var prop in data){
                if(!this.schema.hasOwnProperty(prop)){
                    throw errors.extraneousFieldInData(prop);
                }
            }
        }

        for(var prop in this.schema){

            console.log('prop',prop);

            if(!data.hasOwnProperty(prop)){
                if(this.schema[prop].isMandatoryUponCreate){
                    throw errors.missingMandatoryField(prop);
                }
            }
            else{

                console.log('data:',data[prop],', data type:',typeof(data[prop]),', schema property:',prop,', expected type --->',typeof(this.schema[prop].type));

                if(returnBooleanIfParameterTypesMatch(data[prop],this.schema[prop].type)){
                //if(typeof(data[prop]) == returnTheParameterType(this.schema[prop].type)){
                    console.log('correct type!, expected>>' + this.schema[prop].type + '<< and what we got was>>' + typeof(data[prop]) +'<<');
                }
                else{
                    throw errors.wrongDataType(returnTheType(this.schema[prop].type),typeof(data[prop]));
                }
            }
        }

        if(typeof(this.validate) == 'function' && !this.validate()){
            throw 'Invalid';
        }

        this.data = data;
        return this;
    },
    save: function(collectionInfo){
        //might be able to do an update or save intelligently

        if(this.collectionInfo == null && collectionInfo == null){
            throw errors.beforeSavingModelYouMustDefineACollectionToSaveTo();
            return null;
        }


        console.log('saving meteor model...',this.data);
    },

    update:function(){
        console.log('updated');
    },
    createAndSave: function(data){

        this.data = data;

        if(this.subolass.prototypex.validate()){
            console.log('valid model');
        }
        else{
            return 'Brit is fucking invalid';
        }

        //var sup = this;
        //console.log('this:',sup);

        //var c = sup.subolass.prototypex.create(data);

        return this;
    }
}


PlayerModelPrototype = MeteorModelPrototype.expand({

    schemaAllowExtraneousFields: false,
    schema:{
        name:{
            type:String,
            lengthMin: 1,
            lengthMax: 30,
            isMandatoryUponSave: true,
            isMandatoryUponCreate: true
        },
        value:{
            type: undefined,
            min: 10,
            max: 40,
            isMandatoryUponSave: true,
            isMandatoryUponCreate: true
        }
    },

    collectonInfo:{
        meteorCollection:'',  //which collection to add to
        methodName: 'insertPlayerData'
    },


    print: function(){
        console.log(this);
    },

    init: function(prototype){
        //add hooks here for when object is created
    },

    beforeSave: function(){
        //add hooks here for right before saving
    },
    validate: function(){
        return true;
    }
});


//console.log('PlayerModelPrototype:',PlayerModelPrototype);

var player = PlayerModelPrototype.create({zing:'',name:'1',value:'eege'});
//console.log('player:',player);

/*Doofus = Player.expand({

 dummy: function(){

 },

 expand: function(){

 }

 });

 console.log('doofus:',Doofus);*/


function returnTheType( schemaType ) {
    switch( schemaType ) {
        case String:
            return typeof('');
        case Number:
            return typeof(0);
        case Boolean:
            return typeof true;
        case null:
            return typeof null;
        case undefined:
            return typeof undefined;
        case 'String':
            return typeof('')
        case 'Number':
            return typeof(0);
        case 'string':
            return typeof('');
        case 'number':
            return typeof(0);
        default:
            throw errors.invalidSchemaType(schemaType);
    }
}


function returnBooleanIfParameterTypesMatch( val, schemaType ) {
    switch( schemaType ) {
        case String:
            return typeof(val) === 'string';
        case Number:
            return typeof(val) === 'number';
        case Boolean:
            return typeof(val) === 'boolean';
        case null:
            return typeof(val) === 'null';
        case undefined:
            return typeof(val) === 'undefined';
        case 'String':
            return typeof(val) === 'string';
        case 'Number':
            return typeof(val) === 'number';
        case 'string':
            return typeof(val) === 'string';
        case 'number':
            return typeof(val) === 'number';
        default:
            throw errors.invalidSchemaType(schemaType);
    }
}
