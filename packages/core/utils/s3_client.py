"""S3 client utility for file storage operations."""

import os
import boto3
from typing import Optional, BinaryIO
from botocore.exceptions import ClientError, NoCredentialsError
from botocore.config import Config


class S3Client:
    """S3 client wrapper for file operations."""
    
    def __init__(self):
        """Initialize S3 client."""
        self.endpoint_url = os.getenv("S3_ENDPOINT")
        self.bucket_name = os.getenv("S3_BUCKET")
        self.access_key = os.getenv("S3_ACCESS_KEY")
        self.secret_key = os.getenv("S3_SECRET_KEY")
        self.region = os.getenv("S3_REGION", "eu-central-1")
        
        if not all([self.bucket_name, self.access_key, self.secret_key]):
            raise ValueError("Missing required S3 environment variables")
        
        # For MinIO, we need to use external URLs for presigned URLs to work from browser
        # But keep internal URLs for internal operations
        self.external_endpoint_url = os.getenv("S3_EXTERNAL_ENDPOINT", "http://localhost:9000")
        
        # Initialize S3 client
        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region,
            config=Config(
                retries=dict(max_attempts=3),
                max_pool_connections=50
            )
        )
    
    def upload_file(self, file_path: str, s3_key: str, content_type: Optional[str] = None) -> bool:
        """
        Upload a file to S3.
        
        Args:
            file_path: Local file path
            s3_key: S3 object key
            content_type: Optional content type
            
        Returns:
            True if successful, False otherwise
        """
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            self.s3_client.upload_file(
                file_path, 
                self.bucket_name, 
                s3_key,
                ExtraArgs=extra_args
            )
            return True
            
        except (ClientError, NoCredentialsError) as e:
            print(f"Failed to upload file to S3: {e}")
            return False
    
    def upload_bytes(self, data: bytes, s3_key: str, content_type: Optional[str] = None) -> bool:
        """
        Upload bytes data to S3.
        
        Args:
            data: Bytes data to upload
            s3_key: S3 object key
            content_type: Optional content type
            
        Returns:
            True if successful, False otherwise
        """
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=data,
                **extra_args
            )
            return True
            
        except (ClientError, NoCredentialsError) as e:
            print(f"Failed to upload bytes to S3: {e}")
            return False
    
    def download_file(self, s3_key: str, local_path: str) -> bool:
        """
        Download a file from S3.
        
        Args:
            s3_key: S3 object key
            local_path: Local file path to save to
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.s3_client.download_file(
                self.bucket_name,
                s3_key,
                local_path
            )
            return True
            
        except (ClientError, NoCredentialsError) as e:
            print(f"Failed to download file from S3: {e}")
            return False
    
    def download_bytes(self, s3_key: str) -> Optional[bytes]:
        """
        Download bytes data from S3.
        
        Args:
            s3_key: S3 object key
            
        Returns:
            Bytes data or None if failed
        """
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return response['Body'].read()
            
        except (ClientError, NoCredentialsError) as e:
            print(f"Failed to download bytes from S3: {e}")
            return None
    
    def delete_file(self, s3_key: str) -> bool:
        """
        Delete a file from S3.
        
        Args:
            s3_key: S3 object key
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
            
        except (ClientError, NoCredentialsError) as e:
            print(f"Failed to delete file from S3: {e}")
            return False
    
    def file_exists(self, s3_key: str) -> bool:
        """
        Check if a file exists in S3.
        
        Args:
            s3_key: S3 object key
            
        Returns:
            True if file exists, False otherwise
        """
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=s3_key)
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            raise
        except Exception as e:
            print(f"Error checking if file exists: {e}")
            return False
    
    def list_job_directories(self) -> list[str]:
        """
        List all job directories from S3.
        
        Returns:
            List of job IDs (directory names)
        """
        try:
            # List all objects with prefix 'jobs/'
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix='jobs/'
            )
            
            job_dirs = set()  # Use set to avoid duplicates
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    key = obj['Key']
                    # Extract job ID from key like 'jobs/12345678-1234-1234-1234-123456789abc/template.pptx'
                    if key.startswith('jobs/') and '/' in key[5:]:
                        # Split by '/' and get the job ID part
                        parts = key.split('/')
                        if len(parts) >= 3:  # jobs/[job_id]/[filename]
                            job_id = parts[1]
                            if job_id:  # Ensure it's not empty
                                job_dirs.add(job_id)
            
            return list(job_dirs)
            
        except Exception as e:
            print(f"Error listing job directories: {e}")
            return []
    
    def get_presigned_url(self, s3_key: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for downloading a file.
        
        Args:
            s3_key: S3 object key
            expiration: URL expiration time in seconds (default: 1 hour)
            
        Returns:
            Presigned URL or None if failed
        """
        try:
            # Create a temporary client with external endpoint for presigned URLs
            external_s3_client = boto3.client(
                's3',
                endpoint_url=self.external_endpoint_url,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region,
                config=Config(
                    retries=dict(max_attempts=3),
                    max_pool_connections=50
                )
            )
            
            url = external_s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': s3_key
                },
                ExpiresIn=expiration
            )
            
            return url
            
        except Exception as e:
            print(f"Failed to generate presigned URL: {e}")
            return None
    
    def get_presigned_upload_url(self, s3_key: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for file upload.
        
        Args:
            s3_key: S3 object key
            expiration: URL expiration time in seconds (default: 1 hour)
            
        Returns:
            Presigned URL or None if failed
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': s3_key
                },
                ExpiresIn=expiration
            )
            return url
            
        except (ClientError, NoCredentialsError) as e:
            print(f"Failed to generate presigned upload URL: {e}")
            return None
    
    def list_files(self, prefix: str = "", max_keys: int = 1000) -> list:
        """
        List files in S3 with a given prefix.
        
        Args:
            prefix: Key prefix to filter by
            max_keys: Maximum number of keys to return
            
        Returns:
            List of file keys
        """
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )
            
            if 'Contents' in response:
                return [obj['Key'] for obj in response['Contents']]
            return []
            
        except (ClientError, NoCredentialsError) as e:
            print(f"Failed to list files from S3: {e}")
            return []
    
    def get_file_size(self, s3_key: str) -> Optional[int]:
        """
        Get file size in bytes.
        
        Args:
            s3_key: S3 object key
            
        Returns:
            File size in bytes or None if failed
        """
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return response['ContentLength']
            
        except (ClientError, NoCredentialsError) as e:
            print(f"Failed to get file size: {e}")
            return None
