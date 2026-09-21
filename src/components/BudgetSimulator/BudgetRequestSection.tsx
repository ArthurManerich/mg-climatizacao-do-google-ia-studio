import BudgetSimulator from './BudgetSimulator';
import { BudgetProvider } from '../../context/BudgetContext';

export default function BudgetRequestSection() {
  return (
    <BudgetProvider>
      <BudgetSimulator />
    </BudgetProvider>
  );
}
