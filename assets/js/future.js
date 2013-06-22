(function (root) {

  var _ = root._ || require('../vendor/underscore');

  require('../vendor/underscore-contrib');

  var env = require('./quad-tree');

  require('./children');

  var QuadTree = env.QuadTree,
      Cell = env.Cell;

  function mapConcat (choices) {
    return function (list) {
      return _.map(choices, function (choice) {
        return list.concat([choice])
      })
    }
  }

  function flatMapWith (fn, list) {
    return _.reduce(list, function (acc, element) {
      return acc.concat(fn(element));
    }, [])
  }

  function unit (choices) {
    return _.map(choices, function (choice) {
      return [choice];
    });
  }

  function forChoices (choices) {
    var chooser = _.partial(flatMapWith, mapConcat(choices));
    return _.map(
      _.compose(chooser, chooser, chooser)(unit(choices)),
      function (children) { return new QuadTree(children); });
  }

  function all (generation) {
    if (generation === 0) {
      return [Cell(0), Cell(1)];
    }
    else return forChoices(all(generation - 1));
  }

  var generationTwoFuture = (function () {

    var TABLE = [
      [0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0, 0]
    ];

    return function generationTwoFuture () {
      var nw = this.nw(),
          ne = this.ne(),
          se = this.se(),
          sw = this.sw();

      var nwState = nw.se().id,
          neState = ne.sw().id,
          seState = se.nw().id,
          swState = sw.ne().id;

      // includes +2 if self is alive
      var nwCount = nw.nw().id + nw.ne().id + ne.nw().id
                  + nw.sw().id              + ne.sw().id
                  + sw.nw().id + sw.ne().id + se.nw().id,

          neCount = nw.ne().id + ne.nw().id + ne.ne().id
                  + nw.se().id              + ne.se().id
                  + sw.ne().id + se.nw().id + se.ne().id,

          seCount = nw.se().id + ne.sw().id + ne.se().id
                  + sw.ne().id              + se.ne().id
                  + sw.se().id + se.sw().id + se.se().id,

          swCount = nw.sw().id + nw.se().id + ne.sw().id
                  + sw.nw().id              + se.nw().id
                  + sw.sw().id + sw.se().id + se.sw().id;

      var nwNext  = TABLE[nwState][nwCount],
          neNext  = TABLE[neState][neCount],
          seNext  = TABLE[seState][seCount],
          swNext  = TABLE[swState][swCount];

      var nwCell  = Cell(nwNext),
          neCell  = Cell(neNext),
          seCell  = Cell(seNext),
          swCell  = Cell(swNext);

      return new QuadTree([
        nwCell, neCell, seCell, swCell
      ]);
    }

  })();

  // ....|....
  // ....|....    ...|...
  // ....|....    ...|...
  // ....|....    ...|...
  // ----+---- => ---+---
  // ....|....    ...|...
  // ....|....    ...|...
  // ....|....    ...|...
  // ....|....

  // function bigFuture () {
  //
  //   var nw = this.nw(),
  //       ne = this.ne(),
  //       se = this.se(),
  //       sw = this.sw();
  //
  //   var nn = new QuadTree(
  //         nw.ne(),
  //         ne.nw(),
  //         ne.sw(),
  //         nw.se()
  //       ),
  //       ee = new QuadTree(
  //         ne.sw(),
  //         ne.se(),
  //         se.ne(),
  //         se.nw()
  //       ),
  //
  //
  // }

  _.extend(QuadTree.prototype, {
    future: function () {
      if (this._future) {
        return this._future;
      }
      else if (this.generation === 1) {
        throw "Too small to have a future";
      }
      else if (this.generation === 2) {
        return (this._future = generationTwoFuture.call(this))
      }
      else throw "FIXME: Implement this"
    }
  })

  _.extend(QuadTree, {
    all: all
  });

})(this);