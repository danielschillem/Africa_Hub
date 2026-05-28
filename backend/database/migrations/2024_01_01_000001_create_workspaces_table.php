<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('workspaces', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug', 120)->unique();
            $table->string('logo', 500)->nullable();
            $table->string('industry', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('timezone', 60)->default('Africa/Abidjan');
            $table->enum('plan', ['solo', 'pme', 'pro', 'agence'])->default('solo');
            $table->enum('status', ['trial', 'active', 'expired', 'suspended'])->default('trial');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('plan_ends_at')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workspaces');
    }
};
