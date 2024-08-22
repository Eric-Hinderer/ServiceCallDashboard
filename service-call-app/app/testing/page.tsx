import { Payment, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "489e1d42",
      amount: 125,
      status: "processing",
      email: "example@gmail.com",
    },
    {
      id: "3b92cd23",
      amount: 200,
      status: "success",
      email: "jane.doe@example.com",
    },
    {
      id: "7e23cd12",
      amount: 350,
      status: "failed",
      email: "john.smith@example.com",
    },
    {
      id: "1a23cd45",
      amount: 275,
      status: "pending",
      email: "test1@example.com",
    },
    {
      id: "6c34ab56",
      amount: 180,
      status: "success",
      email: "test2@example.com",
    },
    {
      id: "2b92cf67",
      amount: 310,
      status: "failed",
      email: "customer1@example.com",
    },
    {
      id: "5d23ef89",
      amount: 420,
      status: "processing",
      email: "customer2@example.com",
    },
    {
      id: "8e34fa01",
      amount: 150,
      status: "pending",
      email: "example2@gmail.com",
    },
    {
      id: "4f92cd78",
      amount: 125,
      status: "success",
      email: "random.user@example.com",
    },
    {
      id: "9d34fa23",
      amount: 230,
      status: "failed",
      email: "sample3@example.com",
    },
    {
      id: "10e23dc90",
      amount: 95,
      status: "pending",
      email: "sample4@example.com",
    },
    {
      id: "1f45ab12",
      amount: 400,
      status: "success",
      email: "random.mail@example.com",
    },
    {
      id: "7g56cd34",
      amount: 275,
      status: "processing",
      email: "testmail1@example.com",
    },
    {
      id: "2h67ef45",
      amount: 315,
      status: "failed",
      email: "testmail2@example.com",
    },
  ]
}


export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10 pt-20">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
