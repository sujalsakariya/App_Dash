import { Card, CardContent} from "@mui/material";
import { Table } from "@/pages/leads/table";

const Leads = () => {
    return (
        <div className="w-full bg-white dark:bg-coal-500">
            <Card className="w-full h-full shadow-lg dark:text-black dark:bg-gray-200">
                <CardContent>
                    <Table />
                </CardContent>
            </Card>
        </div>
    )
}

export { Leads };