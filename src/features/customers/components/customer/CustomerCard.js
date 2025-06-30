import { FiEdit2, FiTrash2, FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { Button } from "../../../../components/common/Button";

const CustomerCard = ({ customer, onEdit, onDelete, onView }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {customer.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {customer.type}{" "}
              {customer.businessNumber && `(${customer.businessNumber})`}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {customer.contactName && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              담당자: {customer.contactName}
            </p>
          )}

          {customer.phone && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
              {customer.phone}
            </div>
          )}

          {customer.email && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FiMail className="mr-2 h-4 w-4 text-gray-400" />
              {customer.email}
            </div>
          )}

          {customer.address && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FiMapPin className="mr-2 h-4 w-4 text-gray-400" />
              {customer.address}
            </div>
          )}

          {customer.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {customer.notes}
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView()}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            자세히
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit()}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <FiEdit2 className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete()}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            <FiTrash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
