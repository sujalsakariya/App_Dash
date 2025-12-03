import { Card, CardContent} from "@mui/material";
import { SalesTable } from "@/pages/sales/table";

const Sales = () => {
    return (
        <div className="w-full bg-white dark:bg-coal-200">
            <Card className="w-full h-full shadow-lg dark:text-black dark:bg-gray-200">
                <CardContent>
                    <SalesTable />
                </CardContent>
            </Card>
        </div>
    )
}

export { Sales };