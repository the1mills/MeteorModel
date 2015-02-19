//var objectAssign = require('object-assign');
//var colors = require('colors');
//https://github.com/meteor/meteor/blob/devel/packages/mongo/mongo_driver.js#L67-L111

//package.json vs packages.json
//console.log(Meteor);
//var colors = Meteor.npmRequire('colors');
var colors = Npm.require('colors');

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

//http://en.wikipedia.org/wiki/Decorator_pattern

var warnings = {
   genericWarning: function(msg){
       var warning = 'MeteorModel warning: ' + msg;
//        console.log(warning.yellow);
     console.log(warning);
   }
};

var errors = {

    missingMandatoryField: function(prop){
      return 'MeteorModel error: MeteorModel tried to find the schema-defined field >>\'' + prop + ':\'<< but the data that the user/programmer passed to the create method doesnt contain this required field.' +
            '\nTo remedy this problem, either change the isMandatoryUponCreate field to false, or pass the required datum to the create method. ' +
            '\nFor example, you may have passed this empty data: {}, when' +
            '\nin fact this was required by your MeteorModel schema: {' + prop + ':someValueWithTheCorrectTypeDefinedByYourSchema}';
    },
    cantOverrideSuperObjectMethod: function(attr){
        return 'MeteorModel error: Can\'t override ' + attr + ' method of MeteorModel, sorry, see docs at https://github.com/the1mills/MeteorModel';
    },
    invalidSchemaType: function(schemaType){
        return 'MeteorModel error: The following is not a valid schema type:' + schemaType + ','+
            '\nvalid schema types in MeteorModel correspond to the types that MongoDB will accept and include the literals' +
            '\n(without quotes) String, Number, Integer, Boolean, Null, Code, ObjectID, Symbol, Timestamp, Date, Object, Arrays';
    },
    wrongDataType: function(expectedType, actualType){
        return 'MeteorModel error: Wrong type. It\'s a data and schema mismatch. MeteorModel expected the following type:>>' + expectedType + '<<but the type that we got was>>' + actualType +'<<.' +
            '\nFix either your schema or your data.';
    },
    mustExpandMeteorModel: function(){
        return 'MeteorModel error: The create function happens to exist for the MeteorModelPrototype object, but'+
        '\nyou must call MeteorModelPrototype.expand({your code here}) in order to call \'create\' on the resulting subobject (expansion) -' +
                '\nso instead of calling MeteorModelPrototype.create({}) you must call MeteorModelPrototype.expand({}).create()'+
            '\nsee docs at https://github.com/the1mills/MeteorModel';
    },
    extraneousFieldInData: function(prop){

      return 'MeteorModel error: MeteorModel tried to validate field >>' + prop + '<< but your schema doesn\'t contain this field, and because'+   '\nyou have set this.schemaAllowExtraneousFields to false,' +
          '\nyou cannot pass fields that aren\'t represented in the schema you defined in your MeteorModel expansion object.';

    },
    beforeSavingModelYouMustDefineACollectionToSaveTo: function(){
        return 'MeteorModel error: Before Saving a MeteorModel expansion object you Must Define A Collection To Save To - to fix this error your options are:'+
                '\n(1) quit programming and try another life calling'+
                '\n(2) define a collectionInfo object like so: MeteorModelPrototype.expand({collectionInfo:{}})'+
                '\n(3) pass a Meteor collectionInfo object into the save function like so '
    },
    createDataBeforeSaving: function(){
        return 'MeteorModel error: you must create data for your model by calling create() before saving or simply calling createAndSave()'
    },
    createSchemaBeforeSaving: function(){
        return 'MeteorModel error: you must create a schema for your model by calling create() before saving or simply calling createAndSave()'
    },

    undefinedSchemaError: function(){
        return 'MeteorModel error: you must create a schema for your model by calling create(data,collectionInfo,schema) before saving or simply calling createAndSave()'
    },
    undefinedDataError: function(){
        return 'MeteorModel error: you must create data for your model by calling create(data,[]) before saving or simply calling createAndSave(data,[])'
    },
    errorInUserDefinedInitMethod: function(){
        return 'MeteorModel error: there was an error in the user defined init() function.'
  }
};


MeteorModelPrototype = {

    isMeteorModel: true,

    mmSchema: {

        dateCreated: {
            ignore:true
        },
        dateUpdated: {

        },
        dateFirstSaved: {

        }

    },

    expand: function(subo,schema){
        //should be able to accept a simpleschema object
        //if user wants to call super, calls super methods by using this.superObj

        /*if(this.expandedOnceAlready == null){
         this.expandedOnceAlready = true;
         }
         else{
         throw 'can only expand MeteorModelPrototype to a subobject once';
         return null;
         }*/

        this.prototype = {};
        this._proto_ = {};
        subo.prototype = {}; // just to be damn sure
        subo._proto_ = {};

        if(schema !== undefined) {
            subo.schema = schema;
        }

        if(subo.schema === undefined && this.schema === undefined){
          warnings.genericWarning('MeteorModel warning: Although not strictly required, you may wish to define a schema before creating a saveable instance of this'+ 
                                  'object.' +
            '\nTo turn off this warning in the meantime, add an empty schema:{} field to your MeteorModel expansion object.' +
            '\nYou can do without a schema and do your custom validation in the validate method of your expansion.' +
            '\nIf you have a schema with validation rules, those will be invoked after your custom validate method.');
        }

        for(var attr in subo){
            if(attr == 'expand' || attr == 'create' || attr == 'save' ||attr == 'createAndSave'){
                throw errors.cantOverrideSuperObjectMethod(attr);
            }
        }

        for(var attr in this){
            if(attr == 'isMeteorModel'){
                continue;
            }
            subo[attr.replace('mm_','')] = this[attr];
        }


        return subo;
    },
    mm_create: function(data, collectionInfo, schema){

        if(this.isMeteorModel){
            throw errors.mustExpandMeteorModel();
        }
      
       if(data !== undefined){
            this.data = data;
        }

        if(collectionInfo !== undefined){
            this.collectionInfo = collectionInfo;
        }

        if(schema !== undefined){
            this.schema = schema;
        }

        if(this.schema === undefined){
            throw errors.undefinedSchemaError();
        }
      
        if(this.data === undefined){
            throw errors.undefinedDataError();
        }


        if(this.schemaAllowExtraneousFields === false){
            for(var prop in data){
                if(!this.schema.hasOwnProperty(prop)){
                    throw errors.extraneousFieldInData(prop);
                }
            }
        }

        for(var prop in this.schema){

            if(!this.data.hasOwnProperty(prop)){
                if(this.schema[prop].isMandatoryUponCreate){
                    throw errors.missingMandatoryField(prop);
                }
            }
            else{

                if(!returnBooleanIfParameterTypesMatch(data[prop],this.schema[prop].type)){
                    throw errors.wrongDataType(returnTheType(this.schema[prop].type),typeof(data[prop]));
                }
            }
        }

        if(typeof(this.validate) == 'function' && !this.validate()){
            return {result:'user defined validation failed'};
        }

        this.data = data;

        if(typeof(this.init) == 'function'){
          
          try{
            this.init();
            }
          catch(exception){
            errors.errorInUserDefinedInitMethod();
          }
        }
        return this;
    },
    mm_save: function(collectionInfo){
        //might be able to do an update or save intelligently

        if(this.data === undefined){
            throw errors.createDataBeforeSaving();
        }

        if(collectionInfo !== undefined){
            this.collectionInfo = collectionInfo;
        }

        if(this.schema === undefined){
            throw errors.createSchemaBeforeSaving();
           
        }

        if(this.collectionInfo === undefined){
            throw errors.beforeSavingModelYouMustDefineACollectionToSaveTo();
        }
      
         for(var prop in this.schema){

            if(!this.data.hasOwnProperty(prop)){
                if(this.schema[prop].isMandatoryUponSave){
                    throw errors.missingMandatoryField(prop);
                }
            }
            else{

                if(!returnBooleanIfParameterTypesMatch(this.data[prop],this.schema[prop].type)){
                    throw errors.wrongDataType(returnTheType(this.schema[prop].type),typeof(data[prop]));
                }
            }
        }

        console.log('saving meteor model...',this.data);
    },

    mm_update:function(){
        console.log('updated');
    },
    mm_createAndSave: function(data,collectionInfo,schema){

        this.create(data,collectionInfo,schema);
        this.save();

        return this;
    }
}


// PlayerModelPrototype = MeteorModelPrototype.expand({

//     schemaAllowExtraneousFields: false,
//     schema:{
//         dateCreated: {
//             ignore:true
//         },
//         dateUpdated: {

//         },
//         dateFirstSaved: {

//         },
//         name:{
//             type:String,
//             lengthMin: 1,
//             lengthMax: 30,
//             isMandatoryUponSave: true,
//             isMandatoryUponCreate: true,
//             matches: ['regex'],
//             doesNotMatch: ['regexs']
//         },
//         value:{
//             type: Array,
//             min: 10,
//             max: 40,
//             isMandatoryUponSave: true,
//             isMandatoryUponCreate: true
//         }
//     },

//     collectionInfo:{
//         meteorMongoCollection:'',  //which collection to add to
//         meteorMethodName: 'insertPlayerData'
//     },

//     init: function(prototype){
//         //add hooks here for when object is created

//         console.log('initted');
//     },

//     beforeSave: function(){
//         //add hooks here for right before saving
//     },
//     afterSave: function(){

//     },
//     validateClientSide: function(){
//         return true;
//     },
//     validateServerSide: function(){
//         //this function will be passed to the server
//         return true;
//     }
// });


//console.log('PlayerModelPrototype:',PlayerModelPrototype);

// var mm = MeteorModelPrototype;
// var pp = PlayerModelPrototype;

// var player = PlayerModelPrototype.create({name:'1',value:'eege'});
// player.save();

// //console.log('player:',player);

// Doofus = PlayerModelPrototype.expand({

//  dummy: function(){

//  },

//     save:function(){

//     }

//  });

//  //console.log('doofus:',Doofus);


// jimmy = MeteorModelPrototype.expand({

//     schema:{},
//     dummy: function(){

//     }

// });

// jimmy = MeteorModelPrototype.expand({

//     schema:{},
//     dummy: function(){

//     },

//     savex: function(){

//     }

// });


// for(var i = 0; i < 10000; i++) {
//     jimmy = MeteorModelPrototype.expand({

//         schema: {},
//         dummy: function () {

//         }

//     });

//     jimmy.create({name: '', fark: {}, shit: {poo: {}}})

//     jimmy.save('playyyers');
// }



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