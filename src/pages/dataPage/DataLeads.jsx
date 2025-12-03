import { Card, CardContent} from "@mui/material";
import { DataTable } from "@/pages/dataPage/table";

const DataLeads = () => {
    return (
        <div className="w-full bg-white dark:bg-coal-500">
            <Card className="w-full h-full shadow-lg dark:text-black dark:bg-gray-200">
                <CardContent>
                    <DataTable />
                </CardContent>
            </Card>
        </div>
    )
}

export { DataLeads };