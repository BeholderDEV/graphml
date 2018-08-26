const initializeGraph = async () => {
  const graphData = await receiveGraphData();
  console.log(graphData);
  const config = {
    dataSource: graphData,
    forceLocked: true,
    linkDistance: () => { return 40; },
  
    // nodeTypes: {"type":["curso", "periodo", "disciplina"]},
    caption: (node) => { 
        return node.caption; 
    }
  };
  alchemy = new Alchemy(config);
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