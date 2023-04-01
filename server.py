import http.server
import os

# Define the file types that can be served
FILE_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png'
}

# Define the root directory of the project
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))


class RequestHandler(http.server.BaseHTTPRequestHandler):
    def serve_file(self, file_path):
        try:
            with open(os.path.join(PROJECT_ROOT, file_path), 'rb') as file:
                self.send_response(200)
                self.send_header('Content-type', FILE_TYPES[os.path.splitext(file_path)[1]])
                self.end_headers()
                self.wfile.write(file.read())
        except IOError:
            self.send_error(404)

    def do_GET(self):
        url = self.path[1:]
        
        if url == 'events':
            file_path = 'pages/events.html'
            self.serve_file(file_path)
            return
        if url == 'individuals':
          file_path = 'pages/individuals.html'
          self.serve_file(file_path)
          return
        if url == '':
          file_path = 'pages/overview.html'
          self.serve_file(file_path)
          return
        if url == 'scoreboard':
          file_path = 'pages/scoreboard.html'
          self.serve_file(file_path)
          return
        if url == 'scoring':
          file_path = 'pages/scoring.html'
          self.serve_file(file_path)
          return
        if url == 'teams':
          file_path = 'pages/teams.html'
          self.serve_file(file_path)
          return
        
        # Serve the requested file
        file_extension = os.path.splitext(url)[1]
        if file_extension not in FILE_TYPES:
            self.send_error(404)
            return

        self.serve_file(url)

def run_server():
    # Start the server
    PORT = 3001
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, RequestHandler)
    print(f'Server running at http://localhost:{PORT}/')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
