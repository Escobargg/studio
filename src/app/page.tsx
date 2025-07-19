// This page now redirects to the main groups listing page.
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/grupos');
}
