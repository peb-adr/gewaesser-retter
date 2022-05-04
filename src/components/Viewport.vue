<template>
  <v-app>
    <v-tabs
      v-model="tab">
      <!-- tabs definition -->
      <v-tab>
        Karte
      </v-tab>
      <v-tab>
        Details
      </v-tab>
      <v-tabs-items v-model="tab">
      <!-- tabs details -->
        <v-tab-item>
          <Map
            v-bind:trashData="filteredTrashData"
            v-bind:infoItem="infoItem"
            v-bind:filterName="filterName"
            v-on:update:mapitem="updateItem"
          />
          <!-- binding data makes children get the updates -->
          <!-- v-on listeners enables children to send events -->
        </v-tab-item>
        <v-tab-item>
          <Table
          v-bind:trashData="filteredTrashData"
          v-on:update:mapitem="updateItem"
          v-on:update:filter="updateFilter"
        />
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
    <div class="footer" />
  </v-app>
</template>

<script>

import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";
import Table from "./Table.vue";
import Map from "./Map.vue";

export default {
  components: {
    Table: Table,
    Map: Map
  },
  data: () => ({
    trashData: [],
    filter: () => true,
    filtername: "",
    infoItem: null,
    tab: 0,
    firebaseConfig: {
      apiKey: process.env.VUE_APP_apiKey,
      authDomain: process.env.VUE_APP_authDomain,
      databaseURL: process.env.VUE_APP_databaseURL,
      projectId: process.env.VUE_APP_projectId,
      storageBucket: process.env.VUE_APP_storageBucket,
      messagingSenderId: process.env.VUE_APP_messagingSenderId,
      appId: process.env.VUE_APP_messagingSenderId
      }
  }),
  mounted() {
    this.fetchDummyData();
  },
  computed: {
    filteredTrashData: {
      get() {
        return this.trashData.filter(this.filter);
      }
    }
  },
  methods: {
    fetchDummyData() {
      fetch("dummydata.json").then((response) => {
        response.json().then((data) => {
          this.trashData = data.features.filter(
            (f) => f.geometry && f.geometry.coordinates.length
          );
        });
      });
    },
    updateItem(e){
      this.infoItem = e;
      this.tab = 0;
    },
    updateFilter (e) {
      this.filter = e.fn ? e.fn : () => true;
      this.filterName = e.label || ""
    },
    // TODO Management firebase
    useFireBase() {
      initializeApp(this.firebaseConfig);
      this.db = getDatabase();
      this.featuresRef = this.db.ref("/features");
      this.trashData = this.getSynchronizedArray(this.featuresRef);

      this.wrapLocalCrudOps(this.trashData, this.featuresRef); // TODO ???
    },

    getSynchronizedArray(firebaseRef) {
      let list = [];
      this.syncChanges(list, firebaseRef);
      this.wrapLocalCrudOps(list, firebaseRef);
      return list;
    },

    syncChanges(list, ref) {
      function positionFor(list, key) {
        for (let i = 0, len = list.length; i < len; i++) {
          if (list[i].$id === key) {
            return i;
          }
        }
        return -1;
      }
      // using the Firebase API's prevChild behavior, we
      // place each element in the list after it's prev
      // sibling or, if prevChild is null, at the beginning
      function positionAfter(list, prevChild) {
        if (prevChild === null) {
          return 0;
        } else {
          let i = positionFor(list, prevChild);
          if (i === -1) {
            return list.length;
          } else {
            return i + 1;
          }
        }
      }
      ref.on("child_added", function _add(snap, prevChild) {
        let data = snap.val();
        data.$id = snap.key; // assumes data is always an object
        const pos = positionAfter(list, prevChild);
        list.splice(pos, 0, data);
      });

      ref.on("child_removed", function _remove(snap) {
        const i = positionFor(list, snap.key);
        if (i > -1) {
          list.splice(i, 1);
        }
      });

      ref.on("child_changed", function _change(snap) {
        //var i = positionFor(list, snap.key);
        const i = list.findIndex(
          x => x.properties.RasterID === snap.val().properties.RasterID
        );
        if (i > -1) {
          list.splice(i, 1, snap.val());
          list[i].$id = snap.key;
        }
      });

      ref.on("child_moved", function _move(snap, prevChild) {
        const curPos = positionFor(list, snap.key);
        if (curPos > -1) {
          const data = list.splice(curPos, 1)[0];
          const newPos = positionAfter(list, prevChild);
          list.splice(newPos, 0, data);
        }
      });
    },

    wrapLocalCrudOps(list, firebaseRef) {
      function positionFor(list, key) {
        for (let i = 0, len = list.length; i < len; i++) {
          if (list[i].$id === key) {
            return i;
          }
        }
        return -1;
      }
      // we can hack directly on the array to provide some convenience methods
      list.$add = function(data) {
        if (Object.prototype.hasOwnProperty.call(data, "$id")) {
          delete data.$id;
        }
        return firebaseRef.push(data);
      };

      list.$remove = function(key) {
        firebaseRef.child(key).remove();
      };

      list.$set = function(key, newData) {
        // make sure we don't accidentally push our $id prop
        if (Object.prototype.hasOwnProperty.call(newData, "$id")) {
          delete newData.$id;
        }
        firebaseRef.child(key).set(newData);
      };

      list.$indexOf = function(key) {
        return positionFor(list, key);
      };
    },

  }
}

</script>
