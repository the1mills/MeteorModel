//var objectAssign = require('object-assign');
//var colors = require('colors');
//https://github.com/meteor/meteor/blob/devel/packages/mongo/mongo_driver.js#L67-L111

//package.json vs packages.json
//console.log(Meteor);
//var colors = Meteor.npmRequire('colors');
//var colors = Npm.require('colors');

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

//var objectAssign = require('object-assign');
//var colors = require('colors');
//https://github.com/meteor/meteor/blob/devel/packages/mongo/mongo_driver.js#L67-L111

//settings.json vs packages.json
//console.log(Meteor);
//var colors = Meteor.npmRequire('colors');
//var colors = Npm.require('colors');



//http://en.wikipedia.org/wiki/Decorator_pattern

var warnings = {
    genericWarning: function(msg){
        var warning = 'MeteorModel warning: ' + msg;
//        console.log(warning.yellow);
        console.log(warning);
    },
    shouldExpandMeteorModelAndAddSchema: function(){
        return 'MeteorModel warning: You should call MeteorModel.expand({}) so that you can add a schema etc.';
    }
};

var errors = {

    missingMandatoryUponCreateField: function(prop){
        console.trace();
        return 'MeteorModel error: MeteorModel tried to find the schema-defined field >>\'' + prop + ':\'<< but the data that the user/programmer passed to the create() method doesnt contain this required field.' +
            '\nTo remedy this problem, either change the isMandatoryUponCreate field to false, or pass the required datum to the create method.';
    },
    missingMandatoryUponSaveField: function(prop){
        console.trace();
        return 'MeteorModel error: MeteorModel tried to find the schema-defined field >>\'' + prop + ':\'<< but the data that the user/programmer passed to the save() method doesnt contain this required field.' +
            '\nTo remedy this problem, either change the isMandatoryUponSave field to false, or pass the required datum to the create method.';
    },
    cantOverrideSuperObjectMethod: function(attr){
        console.trace();
        return 'MeteorModel error: Can\'t override ' + attr + ' method of MeteorModel, sorry, see docs at https://github.com/the1mills/MeteorModel';
    },
    invalidSchemaType: function(schemaType){
        console.trace();
        return 'MeteorModel error: The following is not a valid schema type:' + schemaType + ','+
            '\nvalid schema types in MeteorModel correspond to the types that MongoDB will accept and include the literals' +
            '\n(without quotes) String, Number, Integer, Boolean, Null, Code, ObjectID, Symbol, Timestamp, Date, Object, Arrays';
    },
    wrongDataType: function(expectedType, actualType){
        console.trace();
        return 'MeteorModel error: Wrong type. It\'s a data and schema mismatch. MeteorModel expected the following type:>>' + expectedType + '<<but the type that we got was>>' + actualType +'<<.' +
            '\nFix either your schema or your data.';
    },
    mustExpandMeteorModel: function(){
        console.trace();
        return 'MeteorModel error: The create function happens to exist for the MeteorModelPrototype object, but'+
            '\nyou must call MeteorModelPrototype.expand({your code here}) in order to call \'create\' on the resulting subobject (expansion) -' +
            '\nso instead of calling MeteorModelPrototype.create({}) you must call MeteorModelPrototype.expand({}).create()'+
            '\nsee docs at https://github.com/the1mills/MeteorModel';
    },
    extraneousFieldInData: function(prop){
        console.trace();
        return 'MeteorModel error: MeteorModel tried to validate field >>' + prop + '<< but your schema doesn\'t contain this field, and because'+   '\nyou have set this.schemaAllowExtraneousFields to false,' +
            '\nyou cannot pass fields that aren\'t represented in the schema you defined in your MeteorModel expansion object.';

    },
    beforeSavingModelYouMustDefineACollectionToSaveTo: function(){
        console.trace();
        return 'MeteorModel error: Before Saving a MeteorModel (expansion) object you Must Define A Collection To Save To - to fix this error your options are:'+
            '\n(1) define a collectionInfo object like so: MeteorModelPrototype.expand({collectionInfo:{}})'+
            '\n(2) pass a Meteor collectionInfo object into the save function like so save(collectionName)' +
            '\n(3) pass a Meteor collectionInfo object into the createAndSave function like so createAndSave(data,collectionName,schema)'
    },
    createDataBeforeSaving: function(){
        console.trace();
        return 'MeteorModel error: you must create data for your model by calling create() before saving or simply calling createAndSave()'
    },
    createSchemaBeforeSaving: function(){
        console.trace();
        return 'MeteorModel error: you must create a schema for your model by calling create() before saving or simply calling createAndSave()'
    },

    undefinedSchemaError: function(){
        console.trace();
        return 'MeteorModel error: you must create a schema for your model by calling create(data,collectionInfo,schema) before saving or simply calling createAndSave()'
    },
    undefinedDataError: function(){
        console.trace();
        return 'MeteorModel error: you must create data for your model by calling create(data,[]) before saving or simply calling createAndSave(data,[])'
    },
    errorInUserDefinedInitMethod: function(){
        console.trace();
        return 'MeteorModel error: there was an error in the user defined init() function.'
    },
  noCollectionAttachedToMeteorModelObject: function(){
        console.trace();
        return 'MeteorModel error: during saving, no collection was found to be attached to the database object, so the object could not be saved to the MongoDB.'
  }
};


MeteorModel = {

    isMeteorModel: true,

    mmSchema: {

        dateCreated: {
            type: Date
        },
        dateUpdated: {

        },
        dateFirstSaved: {

        }

    },

    mmData: {



    },

    read: function(){



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

        this.prototype = undefined;
        this._proto_ = undefined;
        subo.prototype = undefined; // just to be damn sure
        subo._proto_ = undefined;

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
            if(attr == 'mmSchema' || attr == 'expand' || attr == 'create' || attr == 'save' ||attr == 'createAndSave'){
                throw errors.cantOverrideSuperObjectMethod(attr);
            }
        }

        for(var attrThis in this){
            if(attrThis == 'isMeteorModel' || attrThis == 'data' || attrThis == 'expand' || attrThis == 'save'){
                continue;
            }
            subo[attrThis.replace('mm_','')] = this[attrThis];
        }

        subo.data = undefined;
        return subo;
    },
    create: function(data, collectionInfo, schema){
      
       console.log('create caller:', this.create.caller);

        //var subo = this;

        if(this.isMeteorModel){
            //throw errors.mustExpandMeteorModel();
            console.log(warnings.shouldExpandMeteorModelAndAddSchema());
        }

        var subo = {};


        for(var attrThis in this){
            if(attrThis == 'data' || attrThis == 'expand' || attrThis == 'create' || attrThis == 'createAndSave'){
                continue;
            }
            subo[attrThis.replace('mm_','')] = this[attrThis];
        }


        subo.data = data;
        subo.save = MeteorModel.save;

        if(collectionInfo !== undefined){
            subo.collectionInfo = collectionInfo;
        }

        if(schema !== undefined){
            subo.schema = schema;
        }

        if(subo.schema === undefined && !subo.isMeteorModel){
            throw errors.undefinedSchemaError();
        }

        if(subo.data === undefined){
            throw errors.undefinedDataError();
        }


        if(subo.schemaAllowExtraneousFields === false){
            for(var prop in data){
                if(!subo.schema.hasOwnProperty(prop)){
                    throw errors.extraneousFieldInData(prop);
                }
            }
        }

        for(var propSubo in subo.schema){

            if(!subo.data.hasOwnProperty(propSubo)){
                if(subo.schema[propSubo].isMandatoryUponCreate){
                    if(process.env.NODE_ENV !== 'production') {
                        throw errors.missingMandatoryUponCreateField(propSubo);
                    }
                    else{
                        console.log(errors.missingMandatoryUponCreateField(propSubo));
                    }
                }
            }
            else{

                if(!returnBooleanIfParameterTypesMatch(data[propSubo],subo.schema[propSubo].type)){
                    throw errors.wrongDataType(returnTheType(subo.schema[propSubo].type),typeof(data[propSubo]));
                }
            }
        }

        if(typeof(subo.validate) == 'function' && !subo.validate()){
            return {result:'user defined validation failed'};
        }

//         subo.data = data;

        if(typeof(subo.init) == 'function'){

       // if(getClass.call(subo.init) == '[object Function]'){
            try{
                subo.init();
            }
            catch(exception){
                throw errors.errorInUserDefinedInitMethod();
            }
        }
        //this.data = undefined;
        subo.data = Object.freeze(subo.data); //freeze object data so it can't be altered again before saving
        //return Object.freeze(subo);
        return subo;
    },
    save: function(collectionInfo){
        //might be able to do an update or save intelligently
        //should we check the schema with the data in save? I think not
      check(collectionInfo, Object);
      
      console.log('save caller:', this.save.caller);

        if(this.data === undefined){
            throw errors.createDataBeforeSaving();
        }

        if(collectionInfo !== undefined){
            this.collectionInfo = collectionInfo;
        }

        console.log('saving meteor model (perhaps an expansion of, and isMeteorModel is:',this.isMeteorModel);
        if(this.schema === undefined && this.isMeteorModel === undefined){
            throw errors.createSchemaBeforeSaving();

        }

        if(this.collectionInfo === undefined || (this.collectionInfo.collectionName === undefined && this.collectionInfo.collection === undefined)){
            throw errors.beforeSavingModelYouMustDefineACollectionToSaveTo();
        }

        for(var prop in this.schema){

            if(!this.data.hasOwnProperty(prop)){
                if(this.schema[prop].isMandatoryUponSave){
                    throw errors.missingMandatoryUponSaveField(prop);
                }
            }
            else{

                if(!returnBooleanIfParameterTypesMatch(this.data[prop],this.schema[prop].type)){
                    throw errors.wrongDataType(returnTheType(this.schema[prop].type),typeof(data[prop]));
                }
            }
        }

        console.log('saving meteor model...',this.data);

        var result = null;

        if(this.collectionInfo.meteorMethodName !== undefined){
            console.log('saving with meteor method');
            if(Meteor.isServer){
              
            result = Meteor.call(this.collectionInfo.meteorMethodName, this);
              
            }else if(Meteor.isClient){
              
              
          Meteor.call(this.collectionInfo.meteorMethodName, this, function (error, result) {
           if (error) {
                // handle error
              } else {
                // examine result
              }
            });
              
              return;
           }
        }
      
      
      else{
           console.log('saving with meteor model function');
            result = saveMeteorModelObject(this);
        }


            return {
                result:result,
                MeteorModelObject:this
            }

    },

    update:function(){
      check(postId, String);
        console.log('updated');
    },
    createAndSave: function(data,collectionInfo,schema){

        if(data === undefined){
            throw errors.createDataBeforeSaving();
        }
        if(collectionInfo === undefined){
            throw errors.beforeSavingModelYouMustDefineACollectionToSaveTo();
        }
        if(schema === undefined && this.isMeteorModel === undefined){
            throw errors.undefinedSchemaError();
        }

        var obj = this.create(data,collectionInfo,schema);
        return obj.save();

    }
}


function saveMeteorModelObject(mmo){

var currentUserId = Meteor.userId();
  
//  COLLECTION_NAMES.PlayerCollection.value.allow({
//  insert: function (userId, doc) {
//     return true;
//   }
// });
  if(mmo.collectionInfo.collection){
    mmo.collectionInfo.collection.insert(mmo.data);
  }else if(mmo.collectionInfo.collectionName){
    COLLECTION_NAMES.PlayerCollection.value.insert(mmo.data);
  }else{
    throw errors.noCollectionAttachedToMeteorModelObject();
  }
}


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



