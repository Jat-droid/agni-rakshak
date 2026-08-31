# Multi-stage Dockerfile for ASP.NET Core 8/10 API
# Stage 1: Build .NET API Application
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY ["AgniRakshak.Api.csproj", "./"]
RUN dotnet restore "AgniRakshak.Api.csproj"

COPY . .
RUN dotnet publish "AgniRakshak.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Minimal ASP.NET Core Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

# Persistent data directory for SQLite database (agnirakshak.db)
RUN mkdir -p /app/data
VOLUME /app/data

EXPOSE 5080

ENTRYPOINT ["dotnet", "AgniRakshak.Api.dll"]
