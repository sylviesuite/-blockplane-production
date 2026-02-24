import { Header } from "@/components/Header";

export default function Methodology() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <div className="container mx-auto px-4 py-12 prose prose-xl prose-invert">
        <h1># How BlockPlane Works</h1>
        <p>
          BlockPlane is a decision-support tool designed to help construction professionals compare building materials through a <strong>sustainability and cost lens</strong> during early-stage planning.
        </p>
        <p>
          It does <strong>not</strong> replace professional judgment, engineering analysis, or code compliance.
          Its purpose is to make environmental trade-offs <strong>clearer, more comparable, and more honest</strong>.
        </p>
        <hr />
        <h2>## The Three Metrics We Use</h2>
        <p>BlockPlane evaluates materials using three complementary metrics:</p>
        <h3>### Lifecycle Impact Score (LIS)</h3>
        <p>
          LIS estimates the <strong>overall environmental impact</strong> of a material across defined lifecycle stages, such as production, transport, use, and end-of-life.
        </p>
        <p>
          LIS supports <em>relative comparison</em> between materials. It is not a claim of absolute environmental footprint.
        </p>
        <hr />
        <h3>### Regenerative Impact Score (RIS)</h3>
        <p>
          Regenerative Impact Score (RIS) is a <strong>durability and resilience heuristic</strong>.
        </p>
        <p>
          RIS looks at <strong>moisture behavior, repairability, and how forgiving the assembly is when something goes wrong</strong>.
        </p>
        <p>RIS is expressed on a <strong>0–100 comparative scale</strong>.</p>
        <p><strong>Important limitations:</strong></p>
        <p>RIS is not a performance, safety, or compliance rating. It does not evaluate:</p>
        <ul>
          <li>structural capacity</li>
          <li>fire resistance</li>
          <li>installation quality</li>
          <li>regional construction practices</li>
        </ul>
        <p>
          RIS is intended to support <strong>early-stage comparison and discussion</strong>, not final specification.
        </p>
        <hr />
        <h3>### Cost Per Impact (CPI)</h3>
        <p>
          CPI relates <strong>representative cost data</strong> to environmental impact to help identify value-aligned trade-offs.
        </p>
        <p>
          Cost values are illustrative and not regionally adjusted. CPI does not replace local estimates, bids, or procurement decisions.
        </p>
        <hr />
        <h2>## Assemblies and Components</h2>
        <p>Some entries in BlockPlane represent:</p>
        <ul>
          <li><strong>Assemblies</strong> (multi-layer systems), while others represent</li>
          <li><strong>Components</strong> (individual materials)</li>
        </ul>
        <p>Materials may appear comparable in the database but are not always interchangeable in real construction. Users should always verify system compatibility, performance requirements, and local code implications.</p>
        <hr />
        <h2>## Data Sources and Confidence</h2>
        <p>BlockPlane draws from published research, manufacturer disclosures, and industry references where available.</p>
        <p>Confidence indicators reflect <strong>data completeness and reliability</strong>, not performance certainty.</p>
        <p>Methodology and data quality will evolve as better sources become available.</p>
        <hr />
        <h2>## Intended Use</h2>
        <p>BlockPlane is designed for:</p>
        <ul>
          <li>early-stage material exploration</li>
          <li>sustainability-informed design discussion</li>
          <li>comparative evaluation of alternatives</li>
        </ul>
        <p>It is <strong>not</strong> intended to replace professional analysis or final specification.</p>
        <hr />
        <h2>## Our Commitment to Transparency</h2>
        <p>BlockPlane prioritizes:</p>
        <ul>
          <li>clarity over complexity</li>
          <li>conservative assumptions</li>
          <li>visible limitations</li>
        </ul>
        <p>We believe sustainability tools should <strong>reduce confusion, not create it</strong>.</p>
      </div>
    </div>
  );
}

