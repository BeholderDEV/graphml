const xmlParser = require('xml-js');

class XMLTransformer {

  constructor () {
    this.nodes = [];
  }

  isArray(a) {
    return (!!a) && (a.constructor === Array);
  }

  isObject(o) {
    return o instanceof Object && o.constructor === Object;
  }

  getXMLBaseAtts(obj, baseAtt) {
    const keys = Object.keys(baseAtt);
    keys.forEach(k => {
      obj.attributes[k] = baseAtt[k];
    });
  }

  readArrayFromObject(attName, array, newObj) {
    array.forEach(e => {
      // console.log(attName);
      // console.log(e);
      // console.log('sdasdas');
      if (this.isObject(e)) {
        // console.log('Obj')
        this.readKeysFromObject(attName, e, newObj);
      } 
      if (this.isArray(e)) {
        e.forEach(att => {
          newObj.attributes[attName] = att;
        });
      }
      if (!this.isArray(e) && !this.isObject(e)) {
        const testEmpty = e.trim();
        if (testEmpty !== '') {
          newObj[attName] = e;
        }
      };
    });
  }

  readKeysFromObject(objName, objAtt, objRoot) {
    const newObj = {};
    newObj.name = objName;
    newObj.root = objRoot;
    newObj.attributes = {};
    const keys = Object.keys(objAtt);
    keys.forEach(k =>{
      if (k === '$') {
        this.getXMLBaseAtts(newObj, objAtt[k]);
      }
      if (this.isObject(objAtt[k]) && k !== '$') {
        // const abc = transformObject(k, xml[k].$);
        this.readKeysFromObject(k, objAtt[k], newObj);
        // console.log(abc);
      };
      if (this.isArray(objAtt[k])) {
        this.readArrayFromObject(k, objAtt[k], newObj);
      }
      // const keys2 = Object.keys(xml[k]);
      // console.log(keys2);
    });
    this.nodes.unshift(newObj);
    // console.log('Nome ' + newObj.name);
    // if (newObj.root !== undefined) {
      // console.log('Root ' + newObj.root.name);
    // }
    
  }

  receiveXML(xml) {
    const keys = Object.keys(xml);
    keys.forEach(k =>{
      if (this.isObject(xml[k])) {
        this.readKeysFromObject(k, xml[k]);
      };
      // const keys2 = Object.keys(xml[k]);
      // console.log(keys2);
  
    });
    return this.nodes;
    // this.nodes.forEach(e => {
    //   console.log('Nome ' + e.name);
    //   console.log(e.attributes);
    //   // if (e.root !== undefined) {
    //   //   console.log('Root ' + e.root.name);
    //   // }
    // });
    // console.log('ok');
    // console.log(Object.keys(xml));
  }

}

module.exports = XMLTransformer;

// const isArray = (a) => {
//   return (!!a) && (a.constructor === Array);
// };

// const isObject = (o) => {
//   return o instanceof Object && o.constructor === Object;
// };

// const getXMLBaseAtts = (obj, baseAtt) => {
//   const keys = Object.keys(baseAtt);
//   keys.forEach(k => {
//     obj.attributes[k] = baseAtt[k];
//   });
// };

// const readArrayFromObject = (attName, array, newObj) => {
//   array.forEach(e => {
//     // console.log(attName);
//     // console.log(e);
//     // console.log('sdasdas');
//     if (isObject(e)) {
//       // console.log('Obj')
//       readKeysFromObject(attName, e, newObj);
//     } 
//     if (isArray(e)) {
//       e.forEach(att => {
//         newObj.attributes[attName] = att;
//       });
//     }
//     if (!isArray(e) && !isObject(e)) {
//       const testEmpty = e.trim();
//       if (testEmpty !== '') {
//         newObj[attName] = e;
//       }
//     };
//   });
// };

// const readKeysFromObject = (objName, objAtt, objRoot) => {
//   const newObj = {};
//   newObj.name = objName;
//   newObj.root = objRoot;
//   newObj.attributes = {};
//   const keys = Object.keys(objAtt);
//   keys.forEach(k =>{
//     if (k === '$') {
//       getXMLBaseAtts(newObj, objAtt[k]);
//     }
//     if (isObject(objAtt[k]) && k !== '$') {
//       // const abc = transformObject(k, xml[k].$);
//       readKeysFromObject(k, objAtt[k], newObj);
//       // console.log(abc);
//     };
//     if (isArray(objAtt[k])) {
//       readArrayFromObject(k, objAtt[k], newObj);
//     }
//     // const keys2 = Object.keys(xml[k]);
//     // console.log(keys2);
//   });
//   console.log('Nome ' + newObj.name);
//   if (newObj.root !== undefined) {
//     console.log('Root ' + newObj.root.name);
//   }
  
// };

// exports.receiveXML = (xml) => {
//   const keys = Object.keys(xml);
//   keys.forEach(k =>{
//     if (isObject(xml[k])) {
//       readKeysFromObject(k, xml[k]);
//     };
//     // const keys2 = Object.keys(xml[k]);
//     // console.log(keys2);

//   });
//   console.log('ok');
//   // console.log(Object.keys(xml));
// };