type MetricProps = {
  label: string;
  value: string;
};

export default function Metric({ label, value }: MetricProps) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="shrink-0 text-sm text-neutral-400">{label}</dt>
      <dd className="min-w-0 text-2xl font-semibold text-white">{value}</dd>
    </div>
  );
}
