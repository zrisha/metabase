const axios = require("axios");

class Credentials {
  constructor({ username, password, siteURL, mbSessionAge }) {
    this.username = username;
    this.password = password;
    this.siteURL = siteURL ? siteURL : "http://localhost:3000";
    this.MB_SESSION_AGE = mbSessionAge ? mbSessionAge : 20160;

    this.credentials = null;
  }

  async updateCredentials() {
    try {
      const res = await axios.post(`${this.siteURL}/api/session`, {
        username: this.username,
        password: this.password,
      });
      if (res.status == 200 || res.data.id) {
        const payload = {
          id: res.data.id,
          created_at: Date.now(),
        };
        this.credentials = payload;
        return payload;
      } else {
        return { error: "unknown error", res };
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getCredentials() {
    try {
      if (!this.credentials) {
        await this.updateCredentials();
      } else {
        const totalDuration = process.env.MB_SESSION_AGE * 60 * 1000,
          age = Date.now() - this.credentials.created_at,
          timeLeft = totalDuration - age;

        if (timeLeft < 86400000) {
          await this.updateCredentials();
        }
      }
      return this.credentials;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async testCredentials(creds) {
    const headers = { "X-Metabase-Session": creds.id };
    try {
      const currentUser = await axios.get(`${this.siteURL}/api/user/current`, {
        headers,
      });
      return currentUser.status;
    } catch (e) {
      return e.response.status;
    }
  }
}

module.exports = Credentials;
