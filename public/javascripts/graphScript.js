const colors = ['#FFD123', '#0fcbaa', '#6EEB83', '#FF5714', '#1BE7FF', '#C823FF', '#FF0000', '#B5651D'];

const initializeGraph = async () => {
  const graphData = await receiveGraphData();
  const types = findOutTypes(graphData.nodes);
  const nodeStyles = prepareNodeStyles(graphData.nodes, types.type);
  const config = {
    // dataSource: graphData,
    dataSource: 'api/graph',
    forceLocked: true,
    linkDistance: () => { return 40; },
    nodeTypes: types,
    nodeStyle: nodeStyles,
    caption: (node) => { 
        return node.caption; 
    }
  };
  alchemy = new Alchemy(config);
};

const prepareNodeStyles = (nodes, types) => {
  const style = {"all": 
  {
    radius: 10, 
    color: "#faf", 
    borderColor: "#fff", 
    borderWidth: 2,
  }};
  types.forEach((t, i) => {
    style[t] = {
      color: colors[i % colors.length],
      selected: {
        color: "#FFFFFF",
        borderColor: "#349FE3"
      },
      highlighted: {
        color: "#EEEEFF"
      }
    };
  });
  return style;
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

$(document).ready(() => {
  initializeGraph();
});