"use strict";

class FTL {
  load(buffer) {
    this.dv = new DataView(buffer);
  }

  getInt() {
    return this.dv.getInt32((this.offset += 4) - 4, true);
  }

  skipString() {
    this.offset = this.getInt() + this.offset;
  }

  reset() {
    this.offset = 0;
    this.version = this.getInt();
    if (this.version < 2 || this.version > 11) {
      throw "version error: " + this.version;
    }
    this.skip();
  }

  skip() {
    [
      [5 + ~~(this.version > 10) + ~~(this.version > 6), [this.getInt]],
      [2, [this.skipString]],
      [2, [this.getInt]],
      [this.getInt, [this.skipString, this.getInt]],
      [3, [this.skipString]],
      [this.getInt, [this.skipString, this.skipString]],
      [4, this.version > 6 ? [this.getInt] : []]
    ].map(e => {
      for (
        let i = 0, len = typeof e[0] === "number" ? e[0] : e[0].bind(this)();
        i < len;
        i++
      ) {
        e[1].forEach(x => x.bind(this)());
      }
    });
  }

  getResources() {
    this.reset();
    return ["hull", "fuel", "drones", "missiles", "scrap"].map(e => [
      e,
      this.offset,
      this.getInt()
    ]);
  }

  setResources(res) {
    res.forEach(e => this.dv.setInt32(e[1], e[2], true));
  }
}
