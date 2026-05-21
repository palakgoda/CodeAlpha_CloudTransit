// Mock Firestore for local testing without Java 21 emulator
class MockDoc {
  constructor(id, data = {}) { this.id = id; this._data = data; }
  get() { return Promise.resolve({ exists: Object.keys(this._data).length > 0, data: () => this._data }); }
  update(updates) { Object.assign(this._data, updates); return Promise.resolve(); }
  set(data) { this._data = data; return Promise.resolve(); }
  delete() { this._data = {}; return Promise.resolve(); }
}

class MockCollection {
  constructor(name) { this.name = name; this.docs = {}; }
  doc(id) {
    if (!id) id = Math.random().toString(36).substring(7);
    if (!this.docs[id]) this.docs[id] = new MockDoc(id, {});
    return this.docs[id];
  }
}

class MockFirestore {
  constructor() {
    this.collections = {};
    const routes = new MockCollection('routes');
    // Pre-seed routes for testing
    routes.doc('ROUTE-777')._data = { routeName: "Downtown Express", availableSeats: 50, fare: 250, routeStatus: "OPERATIONAL" };
    routes.doc('ROUTE-101')._data = { routeName: "Local City Line", availableSeats: 50, fare: 300, routeStatus: "OPERATIONAL" };
    this.collections['routes'] = routes;
    this.collections['tickets'] = new MockCollection('tickets');
  }
  collection(name) {
    if (!this.collections[name]) this.collections[name] = new MockCollection(name);
    return this.collections[name];
  }
  runTransaction(fn) {
    const transaction = {
      get: (docRef) => docRef.get(),
      update: (docRef, data) => docRef.update(data),
      set: (docRef, data) => docRef.set(data),
      delete: (docRef) => docRef.delete()
    };
    return fn(transaction);
  }
}

const db = new MockFirestore();
console.log('Mock Firestore client initialized successfully for local UI testing.');
module.exports = { db };
