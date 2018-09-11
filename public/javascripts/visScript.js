const colors = ['#9549A6', '#E13337', '#289456', '#509BCD', '#509BCD', '#7F9EB1'];
const maxLabelSize = 21;
let originalNodes;
let originalEdges;
let currentNode;

const findRelatedNodes = (nodesToDelete, node) => {
  nodesToDelete.add(node.id);
  const relatedEdges = originalEdges.filter(e => e.from === node.id);
  relatedEdges.forEach(e => {
    const relatedNodes = originalNodes.filter(n => n.id === e.to);
    if (relatedNodes[0].type !== node.type) findRelatedNodes(nodesToDelete, relatedNodes[0]);
  });
};

const sendEdit = async (e) => {
  e.preventDefault();
  const formValues = $('form').serializeArray();
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

const editCurrentNode = () => {
  if (currentNode === undefined) return;
  let formString = '<form onsubmit="sendEdit(event)"> <br>';
  const infoKeys = Object.keys(currentNode.info);
  infoKeys.forEach(key => {
    formString += '<div class="form-group row"><label  name="' + key + '" class="col-2 col-form-label">' + key[0].toUpperCase() + key.substring(1) + ':</label>';
    formString += "<div class='col-10'><input class='form-control' type='text' name='" + key + "' value='" + currentNode.info[key] + "'></div></div>" 
  });
  formString += '<input class="btn btn-primary btn-block" type="submit" value="Submit"> <br> </form>';
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
function clearPopUp() {
  document.getElementById('saveButton').onclick = null;
  document.getElementById('cancelButton').onclick = null;
  document.getElementById('network-popUp').style.display = 'none';
}

function cancelEdit(callback) {
  clearPopUp();
  callback(null);
}

function saveData(data,callback) {
  data.id = document.getElementById('node-id').value;
  data.label = document.getElementById('node-label').value;
  clearPopUp();
  callback(data);
}

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
      addNode: function (data, callback) {
        // filling in the popup DOM elements
        console.log('add')
        document.getElementById('operation').innerHTML = "Add Node";
        document.getElementById('node-id').value = data.id;
        document.getElementById('node-label').value = data.label;
        document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
        document.getElementById('cancelButton').onclick = clearPopUp.bind();
        document.getElementById('network-popUp').style.display = 'block';
      },
      editNode: function (data, callback) {
        // filling in the popup DOM elements
        console.log('edit')
        document.getElementById('operation').innerHTML = "Edit Node";
        document.getElementById('node-id').value = data.id;
        document.getElementById('node-label').value = data.label;
        document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
        document.getElementById('cancelButton').onclick = cancelEdit.bind(this,callback);
        document.getElementById('network-popUp').style.display = 'block';
      },
      addEdge: function (data, callback) {
        if (data.from == data.to) {
          var r = confirm("Do you want to connect the node to itself?");
          if (r == true) {
            callback(data);
          }
        }
        else {
          callback(data);
        }
      }
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
  $.get( "api/graph", function( response ) {
    let dados = jQuery.parseJSON(response)
    prepareGraph(dados);
  });
});