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
        $workspace = Workspace::updateOrCreate(
            ['slug' => 'afrihub-demo'],
            [
                'name'          => 'AFRIHUB Demo',
                'industry'      => 'tech',
                'plan'          => 'agence',
                'status'        => 'active',
                'trial_ends_at' => now()->addDays(30),
                'plan_ends_at'  => now()->addYear(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@afrihub.africa'],
            [
                'workspace_id' => $workspace->id,
                'name'         => 'Admin AFRIHUB',
                'password'     => Hash::make('password123'),
                'role'         => 'owner',
                'is_active'    => true,
            ]
        );

        $this->command->info('Workspace demo cree: admin@afrihub.africa / password123');
    }
}
