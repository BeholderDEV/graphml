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

  createLinkTag(rootTag, child, link) {
    const childObj = {};
    childObj[child.type] = {codigo: child.id};
    const currentAttr = rootTag[link.label]
    rootTag[link.label] = (!!currentAttr) ? [...currentAttr, childObj] : [childObj];
  }

  connectTwoTags(rootTag, childTag, childTagName) {
    const currentAttr = rootTag[childTagName];
    console.log('Connect ' + childTagName);
    console.log('Connect ' + JSON.stringify(rootTag));
    rootTag[childTagName] = (!!currentAttr) ? [...currentAttr, childTag]: [childTag];
  }

  readRelatedNodesFromNode(node, nodeTag, json) {
    console.log('ABC')
    const nodesToVisite = json.edges.filter(e => node.id === e.from);
    nodesToVisite.forEach(n => {
      const id = n.to;
      const child = json.nodes.filter(n => n.id === id);
      const sameType = child[0].type === node.type;
      if (sameType) {
        this.createLinkTag(nodeTag, child[0], n);
      } else {
        const tag = this.prepareTagFromObj(child[0]);
        this.connectTwoTags(nodeTag, tag, child[0].type, sameType);
        this.readRelatedNodesFromNode(child[0], tag, json);
      }
    });
  }

  findRootNodeInJSON(json) {
    const root = json.nodes.filter(n => {
      const edges = json.edges.filter(e => n.id === e.to);
      return edges.length === 0;
    });
    return root[0];
  }

  prepareTagFromObj(obj) {
    const tagName = obj.type;
    const keys = Object.keys(obj.info);
    const tagInfo = {};
    keys.forEach(k => tagInfo[k] = obj.info[k]);
    const tag = {};
    tag[tagName] = tagInfo;
    return tag;
  }

  readNodesFromJson(json) {
    const root = this.findRootNodeInJSON(json);
    const tag = this.prepareTagFromObj(root);
    this.readRelatedNodesFromNode(root, tag, json)
    return tag;
  }

  transformIntoXML(obj) {
    const options = {
      spaces: 3,
      compact: true,
      fullTagEmptyElement: true,
      ignoreDeclaration: false,
      ignoreInstruction: false,
      ignoreAttributes: false
    };
    const formatedObj = this.readNodesFromJson(obj);
    console.log(formatedObj);
    const xml = xmlParser.json2xml(formatedObj, options);
    // console.log(xml);
    return xml;
  }

}

module.exports = XMLTransformer;