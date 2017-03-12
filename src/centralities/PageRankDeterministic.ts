/// <reference path="../../typings/tsd.d.ts" />

import * as $G from '../core/Graph';
import * as $SU from "../utils/structUtils";
import {IBaseEdge} from "../core/Edges";
import * as $GAUSS from "../centralities/gauss";

//Calculates the page rank for a given graph
function pageRankDetCentrality( graph: $G.IGraph ) {
  //First initialize the values for all nodes
  let startVal:number = 1 / graph.nrNodes();
  let pageScores:{[k:string]: number;} = {};
  let divideTable = {}; //Tells us how many outgoing edges each node has
  let matr = [];
  let ctr = 0;
  for(let key in graph.getNodes()) {
    divideTable[key] = 0;
  }
  for(let key in graph.getNodes()) { //Run through all nodes in graph
    //pageScores[key] = startVal;
    let node = graph.getNodeById(key);
    let node_InEdges = $SU.mergeObjects([node.inEdges(), node.undEdges()]);
    matr[ctr] = new Array();
    //Find out which other nodes influence the PageRank of this node
    for(let edgeKey in node_InEdges){
      let edge:IBaseEdge = node_InEdges[edgeKey];
      if(edge.getNodes().a.getID() == node.getID()){
        matr[ctr].push(edge.getNodes().b.getID());
        divideTable[edge.getNodes().b.getID()]++; //Count to see how much we have to split the score
      }else{
        matr[ctr].push(edge.getNodes().a.getID());
        divideTable[edge.getNodes().a.getID()]++;
      }
    }
    //We push this to the array and pop it later, this is the current variable (=left side of equation)
    matr[ctr].push(node.getID());
    ctr++;
  }
  ctr = 0;
  let mapCtr = {};
  let numMatr = [[]];
  //console.log(matr);
  //Bring matrix into correct form
  for(let key in matr){                               //  |maybe add +1 here
    numMatr[key] = Array.apply(null, Array(graph.nrNodes() )).map(Number.prototype.valueOf,0); //Fill array with 0
    //set the slot of our variable to -1 (we switch it to the other side)
    let p = matr[key].pop();
    if(mapCtr[p] == null)
      mapCtr[p] = ctr++;
    numMatr[key][mapCtr[p]] = -1;

    for(let k in matr[key]){
      let a = matr[key][k];
      if(mapCtr[a] == null)
        mapCtr[a] = ctr++;
      //console.log("mapCtr:"+mapCtr[a] + " " + a);
      numMatr[key][mapCtr[a]] += 1/divideTable[a];
    }
  }
  //Now add last equation, everything added together should be 1!  | maybe add +1 here
  numMatr[numMatr.length-1] = Array.apply(null, Array(graph.nrNodes() )).map(Number.prototype.valueOf,1);
  let x = Array.apply(null, Array(graph.nrNodes() )).map(Number.prototype.valueOf,0);
  x[x.length-1] = 1;
  x = $GAUSS.gauss(numMatr, x);

  return x;
}

export {
  pageRankDetCentrality
};

//NOTES:
/*
  Insert Interface for Centralities into ICentrality.ts (graphinius.d.ts)
  Every Centrality file should be derifed from this interface

  Change DegreeCentrality to 2 methods: 1 for histogram and 1 for map (map needs to be implemented)


 */