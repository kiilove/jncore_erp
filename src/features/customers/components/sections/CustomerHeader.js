import { Button } from "../../../../components/common/Button";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerHeader = ({ onAddCustomer }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">거래처 관리</h1>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/customers/import")}
          className="flex items-center"
        >
          <Upload className="mr-2 h-4 w-4" />
          엑셀 업로드
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onAddCustomer}
        >
          거래처 추가
        </Button>
      </div>
    </div>
  );
};

export default CustomerHeader;
