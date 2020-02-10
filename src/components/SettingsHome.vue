<template>
  <v-container>
    <v-card flat class="header">
      <v-card-title>
        <h1>Configure Twitter Accounts</h1>
      </v-card-title>
    </v-card>
    <v-card flat @keyup.enter.native="validate()">
      <v-card-title>
        <v-form v-model="valid" ref="form">
          <v-layout row wrap align-center>
            <v-flex xs3>
              <v-text-field
                class="input-field"
                v-model="newTwitterAccount"
                :rules="accountRules"
                required
                label="Twitter Account*"
                single-line
                hide-details
              ></v-text-field>
            </v-flex>
            <v-flex xs2>
              <v-select
                v-model="newTwitterAccountLang"
                :rules="langRules"
                required
                :items="languages"
                menu-props="auto"
                label="Lang*"
                hide-details
                single-line
                class="selector-lang"
              ></v-select>
            </v-flex>
            <v-flex xs2>
              <v-select
                v-model="newTwitterAccountInterval"
                :rules="intervalRules"
                required
                :items="intervals"
                menu-props="auto"
                label="Interval*"
                hide-details
                single-line
                class="selector-lang"
              ></v-select>
            </v-flex>
            <v-flex xs1>
              <v-btn
                small
                outline
                block
                color="primary"
                class="action-button-add"
                :disabled="!valid"
                @click="addTwitterAccount({
              account_name: newTwitterAccount,
              lang: newTwitterAccountLang,
              interval: newTwitterAccountInterval,
              valid: false,
              checking_validity: true,
          })"
              >add</v-btn>
            </v-flex>
          </v-layout>
        </v-form>
      </v-card-title>
    </v-card>
    <v-data-table
      hide-actions
      :headers="tableHeaders"
      :items="twitterAccounts"
      :search="searchQuery"
    >
      <template slot="items" slot-scope="props">
        <tr>
          <td>{{ props.item.account_name }}</td>
          <td>
            <v-layout justify-center>{{ props.item.lang }}</v-layout>
          </td>
          <td>
            <v-layout justify-center>{{ props.item.interval }}</v-layout>
          </td>
          <!-- :style="{backgroundColor: (props.item.valid ? 'rgba(144,238,144,0.2)' : 'transparent' )}" -->
          <td class="text-xs-center">
            <v-progress-circular v-if="props.item.checking_validity" indeterminate></v-progress-circular>
            <v-icon v-else-if="!props.item.checking_validity && props.item.valid">check</v-icon>
            <v-icon v-else>clear</v-icon>
          </td>
          <td class="text-xs-center">
            <v-btn small outline color="error" @click="removeTwitterAccount(props.item)">
              <!-- <v-icon>clear</v-icon> -->
              remove
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
    <br>
    <v-card flat class="header">
      <v-card-title>
        <h1>Change Access Key</h1>
      </v-card-title>
      <v-card-text>
        current access key:
        <b>{{ $store.getters.accessKey }}</b>
        <v-btn small color="primary" @click="changeAccessKey">change</v-btn>
      </v-card-text>
    </v-card>

    <br>

    <TopicsOfInterest />
  </v-container>
</template>

<script>
import axios from "axios";
import {
  GET_TWITTER_ACCOUNT_EXISTS_ENDPOINT,
  GET_TWITTER_OBSERVABLES_ENDPOINT,
  POST_TWITTER_OBSERVABLE_ENDPOINT,
  DELETE_TWITTER_OBSERVABLE_ENDPOINT,
  POST_UPDATE_ACCESS_KEY_CONFIGURATION_ENDPOINT,
  POST_UPDATE_ACCESS_KEY_CONFIGURATION_PAYLOAD
} from "./../RESTconf.js";
import {
  MUTATE_ACCESS_KEY_CONFIGURATION,
  MUTATE_ACCESS_KEY,
  LOCAL_STORAGE_ACCESS_KEY
} from "../store/types.js";
import TopicsOfInterest from "./widget/trend/TopicsOfInterest";
export default {
  name: "SettingsHome",
  components: {TopicsOfInterest},
  data() {
    return {
      tableHeaders: [
        {
          text: "Twitter Account",
          align: "left",
          sortable: false,
          value: "twitter_account",
          width: "80%"
        },
        {
          text: "Lang",
          align: "center",
          sortable: false,
          value: "lang",
          width: "5%"
        },
        {
          text: "Interval",
          align: "center",
          sortable: false,
          value: "interval",
          width: "5%"
        },
        {
          text: "Valid",
          align: "center",
          sortable: false,
          value: "twitter_account_valid",
          width: "5%"
        },
        {
          text: "Action",
          align: "center",
          sortable: false,
          value: "action",
          width: "5%"
        }
      ],
      tooblarTitle: "Settings",
      twitterAccounts: [],
      searchQuery: "",
      /*
       * form fields and validation
       */
      valid: false,
      newTwitterAccount: "",
      accountRules: [v => !!v || "required"],
      newTwitterAccountLang: "",
      languages: ["it", "en"],
      langRules: [
        v => !!v || "required",
        v => this.languages.includes(v) || "not supported"
      ],
      newTwitterAccountInterval: "",
      intervals: ["2h", "daily", "weekly", "monthly"],
      intervalRules: [
        v => !!v || "required",
        v => this.intervals.includes(v) || "not supported"
      ],
      /*
       * errors
       */
      errors: []
    };
  },
  methods: {
    initTwitterAccounts(twitterAccounts) {
      twitterAccounts.forEach(observable => {
        let userConfig = this.$store.getters
          .accessKeyConfigurationTwitterAccounts;
        if (userConfig.includes(observable.account_name)) {
          this.twitterAccounts.push({
            account_name: observable.account_name,
            lang: observable.lang,
            interval: observable.interval,
            valid: true,
            checking_validity: false
          });
        }
      });
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.valid = true;
      }
    },
    reset() {
      this.$refs.form.reset();
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
    addTwitterAccount(twitterAccount) {
      // do not allow duplicates
      var twitterAccountAlreadyAdded =
        this.twitterAccounts.find(function(item) {
          return item.account_name == twitterAccount.account_name;
        }) != undefined;
      if (!twitterAccountAlreadyAdded) {
        this.twitterAccounts.push(twitterAccount);
        this.checkTwitterAccount(twitterAccount);
      }
      this.reset();
    },
    removeTwitterAccount(twitterAccount) {
      this.twitterAccounts = this.twitterAccounts.filter(function(item) {
        return item != twitterAccount;
      });
      // send action to the store
      // notify the orchestration ms
      if (twitterAccount.valid) {
        this.deleteTwitterObservable(twitterAccount.account_name);
        this.postUpdateAccessKeyConfiguration();
      }
    },
    updateTwitterAccounts(response, twitterAccount) {
      for (let i = 0; i < this.twitterAccounts.length; i++) {
        if (
          this.twitterAccounts[i].account_name === twitterAccount.account_name
        ) {
          this.twitterAccounts[i].checking_validity = false;
          this.twitterAccounts[i].valid = response.account_exists;
          break;
        }
      }
    },
    async checkTwitterAccount(twitterAccount) {
      axios
        .get(GET_TWITTER_ACCOUNT_EXISTS_ENDPOINT(twitterAccount.account_name))
        .then(response => {
          this.updateTwitterAccounts(response.data, twitterAccount);
          // if valid send action to the store
          // if valid send info to the orchestrator
          if (response.data.account_exists) {
            this.postNewTwitterObservable(twitterAccount);
            this.postUpdateAccessKeyConfiguration();
          }
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
    async postNewTwitterObservable(twitterAccount) {
      axios
        .post(
          POST_TWITTER_OBSERVABLE_ENDPOINT(
            twitterAccount.account_name,
            twitterAccount.interval,
            twitterAccount.lang
          )
        )
        .catch(e => {
          this.errors.push(e);
        });
    },
    async postUpdateAccessKeyConfiguration() {
      let accessKey = this.$store.getters.accessKey;
      let configuredTwitterAccounts = [];
      this.twitterAccounts.forEach(twitterAccount => {
        configuredTwitterAccounts.push(twitterAccount.account_name);
      });
      let accessKeyConfiguration = this.$store.getters.accessKeyConfiguration;
      accessKeyConfiguration.twitter_accounts = configuredTwitterAccounts;
      this.$store.commit(
        MUTATE_ACCESS_KEY_CONFIGURATION,
        accessKeyConfiguration
      );

      axios
        .post(
          POST_UPDATE_ACCESS_KEY_CONFIGURATION_ENDPOINT(),
          POST_UPDATE_ACCESS_KEY_CONFIGURATION_PAYLOAD(
            accessKey,
            accessKeyConfiguration
          )
        )
        .catch(e => {
          this.errors.push(e);
        });
    },
    async deleteTwitterObservable(accountName) {
      axios.delete(DELETE_TWITTER_OBSERVABLE_ENDPOINT(accountName)).catch(e => {
        this.errors.push(e);
      });
    },
    getTwitterObservables() {
      axios
        .get(GET_TWITTER_OBSERVABLES_ENDPOINT())
        .then(response => {
          this.initTwitterAccounts(response.data);
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
    changeAccessKey() {
      localStorage.setItem(LOCAL_STORAGE_ACCESS_KEY, null);
      this.$store.commit(MUTATE_ACCESS_KEY, null);
      this.$router.push({ path: "/login" });
    }
  },
  mounted() {
    this.$store.dispatch("setToolbarHeader", "Settings");
    this.getTwitterObservables();
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
.header {
  margin-top: 20px;
}
.selector-lang {
  margin-left: 20px;
}
.action-button-add {
  margin-left: 20px;
}
</style>
