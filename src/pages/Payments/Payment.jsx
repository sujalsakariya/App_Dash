import React from 'react'
import { PaymentTable } from './table/Table';
import { Card, CardContent} from "@mui/material";

const Payment = () => {
  return (
            <div className="w-full bg-white dark:bg-coal-500">
            <Card className="w-full h-full shadow-lg dark:text-black dark:bg-gray-200">
                <CardContent>
                    <PaymentTable />
                </CardContent>
            </Card>
        </div>
  )
}

export {Payment};