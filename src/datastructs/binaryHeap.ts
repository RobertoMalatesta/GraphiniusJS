/// <reference path="../../typings/tsd.d.ts" />


export enum BinaryHeapMode {
  MIN,
  MAX
}


export interface IBinaryHeap {
  // Helper methods
  getMode()                     : BinaryHeapMode;
  getArray()                    : Array<any>;
  size()                        : number;
  getEvalPriorityFun()          : Function;
  evalInputPriority(obj: any)   : number;
  getEvalObjIDFun()             : Function;
  evalInputObjID(obj:any)       : any;

  // Actual heap operations
  insert(obj: any)              : void;
  remove(obj: any)              : any;
  peek()                        : any;
  pop()                         : any;
}


class BinaryHeap implements IBinaryHeap {
  private _array = [];
  private _positions : {[id: string]: number} = {}; //  | number[]

  /**
   * Mode of a min heap should only be set upon
   * instantiation and never again afterwards...
   * @param _mode MIN or MAX heap
   * @param _evalPriority the evaluation function applied to
   * all incoming objects to determine it's score
   * @param _evalObjID function to determine the identity of
   * the object we are looking for at removal etc..
   */
  constructor( private _mode = BinaryHeapMode.MIN,
               private _evalPriority = (obj:any) => {
                 if ( typeof obj !== 'number' && typeof obj !== 'string') {
                   return NaN;
                 }
                 return parseInt(obj)
               },
               private _evalObjID = (obj:any) => {
                 return obj;
               }
             ) {}

  getMode() : BinaryHeapMode {
    return this._mode;
  }
  
  getArray() : Array<any> {
    return this._array;
  }
  
  size() : number {
    return this._array.length;
  }

  getEvalPriorityFun(): Function {
    return this._evalPriority;
  }

  evalInputPriority(obj: any) : number {
    return this._evalPriority(obj);
  }

  getEvalObjIDFun() : Function {
    return this._evalObjID;
  }
  
  evalInputObjID(obj:any) : any {
    return this._evalObjID(obj);
  }

  peek() : any {
    return this._array[0];
  }

  pop() {
    return this.remove(this._array[0]);
  }

  /**
   * Insert - Adding an object to the heap
   * @param obj the obj to add to the heap
   * @returns {number} the objects index in the internal array
   */
  insert(obj: any) {
    if ( isNaN( this._evalPriority(obj) ) ) {
      throw new Error("Cannot insert object without numeric priority.")
    }

    this._array.push(obj);
    this.setNodePosition(obj, this.size()-1);
    this.trickleUp(this._array.length - 1);
  }
  
  
  /**
   * 
   */
  remove(obj: any) : any {
    if ( isNaN( this._evalPriority(obj) ) ) {
      throw new Error('Object invalid.');
    }

    // Search in O(1)
    // var objID = this._evalObjID(obj),
    //     pos = this._positions[objID],
    //     found = this._array[pos],
    //     valid = typeof found !== undefined && found !== null,
    //     found = valid ? found : undefined;
    //
    // if ( valid ) {
    //   var last = this._array.pop();
    //   if ( this.size() ) {
    //     this._array[pos] = last;
    //     // update node position before trickling
    //     this.setNodePosition(last, pos);
    //     this.trickleUp(pos);
    //     this.trickleDown(pos);
    //   }
    //   return found;
    // }

    var objID = this._evalObjID(obj),
        found = undefined;
    for (var pos = 0; pos < this._array.length; pos++) {
      if ( this._evalObjID(this._array[pos]) === objID ) {
        found = this._array[pos];
        // we pop the last element
        var last = this._array.pop();
        // we switch the last with the found element
        // and restore the heaps order, but only if the
        // heap size is not down to zero
        if ( this.size() ) {
          this._array[pos] = last;
          this.trickleUp(pos);
          this.trickleDown(pos);
        }
        return found;
      }
    }

    return found;
  }


  private trickleDown(i: number) {
    var parent = this._array[i];

    // run until we manually break
    while (true) {
          var right_child_idx = (i + 1) * 2,
              left_child_idx = right_child_idx - 1,
              right_child = this._array[right_child_idx],
              left_child = this._array[left_child_idx],
              swap = null;

      // check if left child exists
      if ( left_child_idx < this.size() && !this.orderCorrect( parent, left_child ) ) {
        swap = left_child_idx;
      }

      if ( right_child_idx < this.size() && !this.orderCorrect( parent, right_child )
                                         && !this.orderCorrect( left_child, right_child ) ) {
        swap = right_child_idx;
      }

      if ( swap === null ) {
        break;
      }

      // we only have to swap one child, doesn't matter which one
      this._array[i] = this._array[swap];
      this._array[swap] = parent;

      // correct position for later lookup in O(1)
      this.setNodePosition(this._array[i], i);
      this.setNodePosition(parent, swap);

      i = swap;
    }
  }

  private trickleUp(i: number) {
    var child = this._array[i];

    // Can only trickle up from positive levels
    while ( i ) {
      var parent_idx = Math.floor((i + 1) / 2) - 1,
          parent = this._array[parent_idx];
      if ( this.orderCorrect( parent, child ) ) {
        break;
      }
      else {
        this._array[parent_idx] = child;
        this._array[i] = parent;

        // correct position for later lookup in O(1)
        this.setNodePosition(child, parent_idx);
        this.setNodePosition(parent, i);

        // next round...
        i = parent_idx;
      }
    }
  }

  private orderCorrect(obj_a, obj_b) {
    var obj_a_pr = this._evalPriority(obj_a);
    var obj_b_pr = this._evalPriority(obj_b);
    if ( this._mode === BinaryHeapMode.MIN ) {
      return obj_a_pr <= obj_b_pr;
    }
    else {
      return obj_a_pr >= obj_b_pr;
    }
  }

  /**
   * Superstructure to enable search in BinHeap in O(1)
   * @param obj
   * @param pos
   */
  private setNodePosition(obj: any, pos: number) : void {

    this._positions[this.evalInputObjID(obj)] = pos;
  }

  private getNodePosition(obj: any) : number {

    return 0;
  }
}


export { BinaryHeap };

