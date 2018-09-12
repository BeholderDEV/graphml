const colors = ['#9549A6', '#E13337', '#289456', '#509BCD', '#509BCD', '#7F9EB1'];
const maxLabelSize = 21;
let attrCounter = 0;
let originalNodes;
let originalEdges;
let currentNode;
let currentNewEdge;

const findRelatedNodes = (nodesToDelete, node) => {
  nodesToDelete.add(node.id);
  const relatedEdges = originalEdges.filter(e => e.from === node.id);
  relatedEdges.forEach(e => {
    const relatedNodes = originalNodes.filter(n => n.id === e.to);
    if (relatedNodes[0].type !== node.type) findRelatedNodes(nodesToDelete, relatedNodes[0]);
  });
};

const findRootNode = () => {
  const rootNode = originalNodes.filter(n => {
    const leafEdge = originalEdges.filter(e => n.id === e.to);
    return (leafEdge[0] === undefined) ? true : false;
  });
  return rootNode[0];
};

const sendEdit = async (e) => {
  e.preventDefault();
  const formValues = $('#formEdit').serializeArray();
  const editedNode = {};
  formValues.forEach(v => {
    editedNode[v.name] = v.value;
  });
  const response = await fetch("api/graph/", { method: 'PUT', headers: { "Content-Type": "application/json" }, body: JSON.stringify({id: currentNode.id, info: editedNode})})
                         .then(response => response.json());
  $('#modalEdit').modal('hide');
  if (!!response.nodes) {
    prepareGraph(response);
  }
};

const prepareNewNode = (formValues) => {
  const newNode = {};
  newNode.info = {};
  for (let i = 0; i < formValues.length; i++) {
    const v = formValues[i];
    if(v.name.trim() === '' || v.value.trim() === '' ) {
      alert('Campos Vazios');
      return;
    }
    if (i <= 2) {
      newNode.info[v.name] = v.value;
      continue;
    }
    if (i > 2 && i % 2 === 0) {
      newNode.info[formValues[i - 1].value] = v.value;
    }
  }
  if (newNode.info['relatedNode'] === 'raiz'){
    newNode.info['relatedNode'] = findRootNode().id.toString();
    newNode.root = true;
  } else {
    newNode.root = false;
  }
  return newNode;
};

const sendAdd = async (e) => {
  e.preventDefault();
  console.log('Adding');
  const formValues = $('#formAdd').serializeArray();
  const newNode = prepareNewNode(formValues);
  const response = await fetch("api/graph/node", { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify({root: newNode.root, node: newNode.info})})
                         .then(response => response.json());
  $('#modalAdd').modal('hide');
  console.log(response);
  if (!!response.nodes) {
    prepareGraph(response);
  }
};

const editCurrentNode = () => {
  if (currentNode === undefined) return;
  let formString = '<form id="formEdit" onsubmit="sendEdit(event)"> <br>';
  const infoKeys = Object.keys(currentNode.info);
  infoKeys.forEach(key => {
    formString += '<div class="form-group row"><label  name="' + key + '" class="col-2 col-form-label">' + key[0].toUpperCase() + key.substring(1) + ':</label>';
    formString += "<div class='col-10'><input class='form-control' type='text' name='" + key + "' value='" + currentNode.info[key] + "'></div></div>" 
  });
  formString += '<input class="btn btn-primary btn-block" type="submit" value="Submit"> </form>';
  $('#modalEditTitle').text(currentNode.type[0].toUpperCase() + currentNode.type.substring(1));
  $('#modalEditBody').empty().append(formString);
  $('#modalEdit').modal('show');
  $('#modalNode').modal('hide'); 
};

const deleteCurrentNode = async () => {
  if (currentNode === undefined) return;
  const nodesToDelete = new Set();
  await findRelatedNodes(nodesToDelete, currentNode);
  const nodes = [...nodesToDelete];
  const response = await fetch("api/graph/", { method: 'DELETE', headers: { "Content-Type": "application/json" }, body: JSON.stringify({nodes})})
  .then(response => response.json());
  $('#modalNode').modal('hide'); 
  if (!!response.nodes) {
    prepareGraph(response);
  }
};

const findNodeById = (id) => {
  const node = originalNodes.filter(n => n.id === id);
  return node[0];
};

const showNodeModal = (node) => {
  currentNode = node;
  const infoKeys = Object.keys(node.info);
  let fullInfo = [];
  infoKeys.forEach(key => {
    const info = '<strong>' + key[0].toUpperCase() + key.substring(1) + '</strong>: ' + node.info[key] + ' <br> ';
    (key === 'nome') ? fullInfo.unshift(info) : fullInfo.push(info);
  });
  $('#modalTitle').text(node.type[0].toUpperCase() + node.type.substring(1));
  $('#modalBody').empty().append('<p>' + fullInfo.join('') + '</p>');
  $('#modalNode').modal('show'); 
};

const findOutTypes = (nodes) => {
  const types = new Set(nodes.map(n => n.type));
  return ({type: [...types]});
};

const receiveGraphData = async () => {
  const sessionData = sessionStorage.getItem('graphData');
  if (!!sessionData) return JSON.parse(sessionData);
  const graphData = await fetch('api/graph', { method: 'GET'}).then(response => response.json());
  return graphData;
};

const prepareNetworkInteraction = (network) => {
  network.on("click", function (params) {
    const nodeId = this.getNodeAt(params.pointer.DOM);
    if (nodeId !== undefined) {
      showNodeModal(findNodeById(nodeId));
    }
  });
};

const startModalAddNode = () => {
  $('#modalAddTipo').val('');
  $('#modalAddNome').val('');
  $('#selectParentNode').empty().append("<option class='ddindent' value='raiz'>Nenhum</option>");
  originalNodes.forEach(n => $('#selectParentNode').append("<option class='ddindent' value='"+ n.id +"'>"+ n.type[0].toUpperCase() + n.type.substring(1) + ' - ' + n.label +"</option>"));
  $('#rowAddAttr').empty().hide();
  $('#modalAdd').modal('show');
};

const addSpaceForAttr = () => {
  console.log('Adding Space');
  $('#rowAddAttr').append('<div class="form-group row"><div class="col-2"><input  name="' + attrCounter +'" class="form-control"></div><div class="col-10"><input class="form-control" type="text" name="' + attrCounter + 'Value"></div></div>');
  $('#rowAddAttr').show();
};

const startModalAddEdge = () => {
  $('#modalEdgeTipo').val('');
  $('#modalEdge').modal('show');
};

const checkValidEdge = (formValues) => {
  if (formValues[0].value.trim() === '') {
    alert('Escreva o Tipo');
    return false;
  }
  const relation = originalEdges.filter(e => (e.to === currentNewEdge.to && e.from === currentNewEdge.from) || (e.to === currentNewEdge.from && e.from === currentNewEdge.to))
  if (!!relation[0]){
    alert('Não pode ter relações Duplicadas');
    return false;
  }
  const nodeTo = originalNodes.filter(n => n.id === currentNewEdge.to);
  if (nodeTo[0].info.codigo === undefined){
    alert('Nodo Destino Preciso ter um atributo Código');
    return false;
  }
  return true;
}

const sendEdge = async (event) => {
  event.preventDefault();
  const formValues = $('#formEdge').serializeArray();
  if (!checkValidEdge(formValues)) return;
  currentNewEdge.relation = formValues[0].value;
  const response = await fetch("api/graph/edge", { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify(currentNewEdge)})
                               .then(response => response.json());
  $('#modalEdge').modal('hide');
  console.log(response);
  if (!!response.nodes) {
    prepareGraph(response);
  }
};

const addEdge = (data) => {
  if (data.from === data.to) return;
  currentNewEdge = data;
  startModalAddEdge();
};

const prepareGraph = (graph) => {
  originalNodes = graph.nodes;
  originalEdges = graph.edges;
  console.log(graph.nodes);
  console.log(graph.edges);
  const container = document.getElementById('mynetwork');
  const data = {
      nodes: graph.nodes,
      edges: graph.edges
  };
  const options = {
    locale: 'pt-br',
    manipulation: {
      addNode: (data, callback) => startModalAddNode(),
      deleteNode: false,
      editEdge: false,
      addEdge: (data, callback) => addEdge(data),
      //   if (data.from == data.to) {
      //     var r = confirm("Do you want to connect the node to itself?");
      //     if (r == true) {
      //       callback(data);
      //     }
      //   }
      //   else {
      //     callback(data);
      //   }
    },
    physics: {
        forceAtlas2Based: {
            gravitationalConstant: -26,
            centralGravity: 0.005,
            springLength: 230,
            springConstant: 0.18
        },
        maxVelocity: 106,
        solver: 'forceAtlas2Based',
        timestep: 0.35,
        stabilization: {iterations: 150}
    },
    interaction: {hover:true},
    nodes: {
      shape: 'circle',
      font: {size: 20},
    },
    edges: {
      width: 5,
      smooth: true,
      arrows: {
        to: {
          enabled: true, scaleFactor: 1.5, type:'arrow'
        }
      }
    }  
  };
  const network = new vis.Network(container, data, options);
  prepareNetworkInteraction(network);
};

$(document).ready(() => {
  $("#deleteButton").on("click", deleteCurrentNode);
  $("#editButton").on("click", editCurrentNode);
  $("#addAttr").on("click", addSpaceForAttr);
  $.get( "api/graph", function( response ) {
    let dados = jQuery.parseJSON(response)
    prepareGraph(dados);
  });
});