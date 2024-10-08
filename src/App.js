import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import { GlobalContextProvider } from "./context/DefaultContext";
import ProductExelUpload from "./pages/ProductExelUpload";
import ProductList from "./pages/ProductList";
import CreateStandardQuote from "./pages/CreateStandardQuote";
import EditStandardQuote from "./pages/EditStandardQuote";
import CompanyInfo from "./pages/CompanyInfo";
import ClientExelUpload from "./pages/ClientExelUpload";
import ClientList from "./pages/ClientList";
import ClientInfo from "./pages/ClientInfo";
import CreateQuote from "./pages/CreateQuote";
import QuoteList from "./pages/QuoteList";
import ViewQuote from "./pages/ViewQuote";
import JncoreQuote from "./pages/JncoreQuote";

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
          <Route
            path="/53738752-4a62-4aa0-8909-de473cd5b2a8"
            element={<Main children={<ClientExelUpload />} />}
          />{" "}
          <Route
            path="/7bbef8fb-ab26-4969-a633-0ad164fc63d2"
            element={<Main children={<ClientList />} />}
          />
          <Route
            path="/5994c397-ba14-4595-a142-6ed2e76bb822"
            element={<Main children={<ClientInfo />} />}
          />
          <Route
            path="/46b24c26-798a-4e1c-9cdc-a6e1ab3ae39d"
            element={<Main children={<QuoteList />} />}
          />
          <Route
            path="/3f1877b4-93ed-4cd7-93bc-ea058bb34dff"
            element={<Main children={<CreateQuote />} />}
          />
          <Route
            path="/6002bd8f-b3c1-48c7-a70b-e6052b446515"
            element={<Main children={<JncoreQuote />} />}
          />
        </Routes>
      </BrowserRouter>
    </GlobalContextProvider>
  );
}

export default App;
