
import MeasurementTool from "../components/MeasurementTool";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Apparel Measurement Analysis Tool
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Upload an image of your apparel and create precise measurements with our professional measurement tool. 
            Generate detailed reports with measurement tables and annotated images.
          </p>
        </div>
        <MeasurementTool />
      </div>
    </div>
  );
};

export default Index;
