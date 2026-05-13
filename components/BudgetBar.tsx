type Props = {
  allocated: string
  spent: string
}

export function BudgetBar({ allocated, spent }: Props) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Allocated: <strong className="text-foreground">{allocated}</strong></span>
        <span>Spent: <strong className="text-foreground">{spent}</strong></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-400 rounded-full w-1/2" />
      </div>
      <p className="text-xs text-muted-foreground italic">
        Exact utilisation % requires official budget data — tracked as qualitative reference.
      </p>
    </div>
  )
}
