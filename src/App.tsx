import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Secteurs from "./pages/Secteurs";
import GroupFiche from "./pages/GroupFiche";
import ProposerSource from "./pages/ProposerSource";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="secteurs" element={<Secteurs />} />
        <Route path="groupes/:groupId" element={<GroupFiche />} />
        <Route path="proposer-une-source" element={<ProposerSource />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
