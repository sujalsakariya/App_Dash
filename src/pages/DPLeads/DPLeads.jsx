import { Card, CardContent} from "@mui/material";
import { DPTable } from "../DPLeads/table";

const DPLeads = () => {
    return (
        <div className="w-full bg-white dark:bg-coal-500">
            <Card className="w-full h-full shadow-lg dark:text-black dark:bg-gray-200">
                <CardContent>
                    <DPTable />
                </CardContent>
            </Card>
        </div>
    )
}

export { DPLeads };