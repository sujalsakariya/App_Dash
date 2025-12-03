import { Card, CardContent} from "@mui/material";
import { ReportTable } from "@/pages/report/table";

const Report = () => {
    return (
        <div className="w-full bg-white dark:bg-coal-200">
            <Card className="w-full h-full shadow-lg dark:text-black dark:bg-gray-200">
                <CardContent>
                    <ReportTable /> 
                </CardContent>
            </Card>
        </div>
    )
}

export { Report };