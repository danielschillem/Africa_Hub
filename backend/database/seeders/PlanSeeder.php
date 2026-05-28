<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Workspace;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        // Workspace demo pour tester
        $workspace = Workspace::create([
            'name'          => 'AFRIHUB Demo',
            'slug'          => 'afrihub-demo',
            'industry'      => 'tech',
            'plan'          => 'agence',
            'status'        => 'active',
            'trial_ends_at' => now()->addDays(30),
            'plan_ends_at'  => now()->addYear(),
        ]);

        User::create([
            'workspace_id' => $workspace->id,
            'name'         => 'Admin AFRIHUB',
            'email'        => 'admin@afrihub.africa',
            'password'     => Hash::make('password123'),
            'role'         => 'owner',
        ]);

        $this->command->info('Workspace demo cree: admin@afrihub.africa / password123');
    }
}
