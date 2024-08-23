const Page = () => {
  return (
    <div className="pt-20 px-6">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-10">
        Dashboard Charts
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <iframe
          className="w-full h-80"
          style={{
            background: "#21313C",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 15px 0 rgba(70, 76, 79, 0.3)",
          }}
          src="https://charts.mongodb.com/charts-project-0-umtdugs/embed/charts?id=66c818af-f79d-4326-8cd8-634c8d0a2d52&maxDataAge=86400&theme=dark&autoRefresh=true"
          title="MongoDB Chart 1"
        />
        {/* Add more iframes for additional charts */}
        <iframe
          style={{
            background: "#FFFFFF",
            border: "none",
            borderRadius: "2px",
            boxShadow: "0 2px 10px 0 rgba(70, 76, 79, .2)",
          }}
          width="640"
          height="480"
          src="https://charts.mongodb.com/charts-project-0-umtdugs/embed/charts?id=66c81c6d-d25c-4df6-8654-a631eab1c9b5&maxDataAge=86400&theme=light&autoRefresh=true"
          title="MongoDB Chart"
        />

        {/* Repeat for additional charts */}
      </div>
    </div>
  );
};

export default Page;
