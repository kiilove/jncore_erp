import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import { GlobalContextProvider } from "./context/DefaultContext";
import ProductExelUpload from "./pages/ProductExelUpload";
import ProductList from "./pages/ProductList";
import CreateStandardQuote from "./pages/CreateStandardQuote";
import EditStandardQuote from "./pages/EditStandardQuote";
import CompanyInfo from "./pages/CompanyInfo";

function App() {
  return (
    <GlobalContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route
            path="/eff179b5-a575-4046-99f3-ca0dc465af3e"
            element={<Main children={<ProductList />} />}
          />
          <Route
            path="/ed4599ce-5808-462c-b10f-3eee0df54dd1"
            element={<Main children={<ProductExelUpload />} />}
          />
          <Route
            path="/8e4314e1-ec72-47b5-84e2-114a5e7a697a"
            element={<Main children={<CreateStandardQuote />} />}
          />
          <Route
            path="/337a93f8-ff79-4ce9-95a7-6b041bb41"
            element={<Main children={<EditStandardQuote />} />}
          />
          <Route
            path="/c91b9c9b-cc95-4605-be48-5a359a4e100a"
            element={<Main children={<CompanyInfo />} />}
          />
        </Routes>
      </BrowserRouter>
    </GlobalContextProvider>
  );
}

export default App;
