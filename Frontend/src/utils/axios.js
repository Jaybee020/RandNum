import axios from "axios";

axios.defaults.baseURL = "https://algolotto.herokuapp.com/lottoGame";
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
