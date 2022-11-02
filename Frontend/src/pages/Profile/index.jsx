import "./index.scss";
import ProfileStats from "./ProfileStats";
import Navbar from "../../components/layout/Navbar";
import ProfileTable from "../../components/common/ProfileTable";
import { useQuery } from "react-query";
import { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import { getBalance } from "../../utils/helpers";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [txnHistory, setTxnHistory] = useState(null);

  const addr = "6RBLE64BI2Q3QARZHF6YVBBL323QC2GO27HLJ4EAYK6QVB6QUIWJMQIERI";

  const fetchData = (route, setDataState) => {
    return () =>
      axios.get(route).then(response => setDataState(response?.data?.data));
  };

  const queryConfig = {
    refetchOnWindowFocus: false,
    retry: false,
  };

  const { isLoading: fetchingDets, error: errorDets } = useQuery(
    "profile",
    fetchData(`/profile/${addr}`, setProfileData),
    queryConfig
  );

  const { isLoading: fetchingTxns, error: errorTxns } = useQuery(
    "lottoPayTXnHistory",
    fetchData(`/lottoPayTXnHistory`, setTxnHistory),
    queryConfig
  );

  useEffect(() => {
    // console.log();
  }, [profileData, txnHistory]);

  return (
    <div className="profile-page">
      <Navbar />
      {txnHistory && <ProfileStats txnHistory={txnHistory} addr={addr} />}
      <ProfileTable profileData={profileData} addr={addr} />
    </div>
  );
};

export default Profile;
