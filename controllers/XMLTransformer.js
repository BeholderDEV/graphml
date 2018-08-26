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
      if (this.isObject(e)) {
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
          newObj.attributes[attName] = e;
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
        this.readKeysFromObject(k, objAtt[k], newObj);
      };
      if (this.isArray(objAtt[k])) {
        this.readArrayFromObject(k, objAtt[k], newObj);
      }
    });
    this.nodes.unshift(newObj);    
  }

  receiveXML(xml) {
    const keys = Object.keys(xml);
    keys.forEach(k =>{
      if (this.isObject(xml[k])) {
        this.readKeysFromObject(k, xml[k]);
      };  
    });
    return this.nodes;
  }

}

module.exports = XMLTransformer;